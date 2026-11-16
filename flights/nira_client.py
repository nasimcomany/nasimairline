"""
Nira API Client for IBE (Third Generation) Web Site Integration

این فایل برای ارتباط با سیستم نیرا (Nira) استفاده می‌شود.
طبق مستندات: IBE (Third Generation) Web Site Integration
"""
import requests
import logging
from typing import Dict, List, Optional, Any, Tuple
from django.conf import settings
from datetime import datetime, timedelta
from persiantools.jdatetime import JalaliDate
from cachetools import TTLCache
import hashlib

from nasim.resilience import (
    CircuitOpenError,
    OverloadedError,
    nira_guarded,
    nira_soft_error,
)

logger = logging.getLogger(__name__)

# Shared session — connection reuse under peak search traffic
_http_session: Optional[requests.Session] = None
_http_lock = __import__('threading').Lock()


def _get_http_session() -> requests.Session:
    global _http_session
    if _http_session is not None:
        return _http_session
    with _http_lock:
        if _http_session is None:
            session = requests.Session()
            adapter = requests.adapters.HTTPAdapter(
                pool_connections=8,
                pool_maxsize=8,
                max_retries=0,
            )
            session.mount('https://', adapter)
            session.mount('http://', adapter)
            _http_session = session
        return _http_session


class NiraClient:
    """
    Client for Nira API integration
    """
    
    def __init__(self):
        """
        Initialize Nira client with settings and cache
        """
        self.base_url = getattr(settings, 'NIRA_BASE_URL', '')
        self.api_url = f"{self.base_url}/api/Res" if self.base_url else None
        self.ws_url = f"{self.base_url}/ws1/NRSCWS.jsp" if self.base_url else None
        self.office_user = getattr(settings, 'NIRA_OFFICE_USER', '')
        self.office_pass = getattr(settings, 'NIRA_OFFICE_PASS', '')
        # Keep short: long hangs pin Gunicorn threads → site-wide 503
        self.timeout = int(getattr(settings, 'NIRA_API_TIMEOUT', 15))
        self.connect_timeout = int(getattr(settings, 'NIRA_CONNECT_TIMEOUT', 3))
        self.routes_cache_ttl = int(getattr(settings, 'NIRA_ROUTES_CACHE_TTL', 300))
        self.routes_stale_ttl = int(getattr(settings, 'NIRA_ROUTES_STALE_TTL', 86400))
        self.availability_cache_ttl = int(getattr(settings, 'NIRA_AVAILABILITY_CACHE_TTL', 60))
        
        # Process-local fallback if Redis/LocMem glitches mid-request
        self._routes_cache = TTLCache(maxsize=100, ttl=self.routes_cache_ttl)
        
        if not self.base_url:
            logger.warning("NIRA_BASE_URL is not set in settings")

    def _timeout_tuple(self, read: Optional[int] = None) -> Tuple[float, float]:
        return (float(self.connect_timeout), float(read if read is not None else self.timeout))

    def _http_get(self, url: str, *, params=None, headers=None, read_timeout: Optional[int] = None, **kwargs):
        return _get_http_session().get(
            url,
            params=params,
            headers=headers,
            timeout=self._timeout_tuple(read_timeout),
            **kwargs,
        )

    def _http_post(self, url: str, *, params=None, json=None, headers=None, read_timeout: Optional[int] = None, **kwargs):
        return _get_http_session().post(
            url,
            params=params,
            json=json,
            headers=headers,
            timeout=self._timeout_tuple(read_timeout),
            **kwargs,
        )

    def _stale_key(self, key: str) -> str:
        return f'{key}:stale'

    def _store_fresh_and_stale(self, key: str, result: Dict[str, Any], fresh_ttl: int) -> None:
        from nasim.cache_utils import cache_set
        cache_set(key, result, fresh_ttl)
        cache_set(self._stale_key(key), result, self.routes_stale_ttl)

    def _serve_stale(self, key: str, reason: str) -> Optional[Dict[str, Any]]:
        from nasim.cache_utils import cache_get
        stale = cache_get(self._stale_key(key))
        if stale and isinstance(stale, dict) and stale.get('success'):
            out = dict(stale)
            out['stale'] = True
            out['degraded'] = True
            out['stale_reason'] = reason
            logger.warning('Serving stale Nira cache for %s (%s)', key, reason)
            return out
        return None
    
    def _convert_to_jalali(self, date_obj: datetime) -> str:
        """
        Convert Gregorian date to Jalali (Persian) date format
        
        Args:
            date_obj: datetime object
            
        Returns:
            Jalali date string in format: YYYY-MM-DD (e.g., 1401-09-13)
        """
        try:
            jalali = JalaliDate.to_jalali(date_obj.year, date_obj.month, date_obj.day)
            return f"{jalali.year}-{jalali.month:02d}-{jalali.day:02d}"
        except Exception as e:
            logger.error(f"Error converting date to Jalali: {e}")
            # Fallback: return current date in Jalali format
            today = JalaliDate.today()
            return f"{today.year}-{today.month:02d}-{today.day:02d}"
    
    def _convert_from_jalali(self, jalali_date: str) -> Optional[datetime]:
        """
        Convert Jalali date string to Gregorian datetime
        
        Args:
            jalali_date: Jalali date string in format YYYY-MM-DD (e.g., 1401-09-13)
            
        Returns:
            datetime object or None if conversion fails
        """
        try:
            parts = jalali_date.split('-')
            if len(parts) != 3:
                return None
            
            year, month, day = int(parts[0]), int(parts[1]), int(parts[2])
            gregorian = JalaliDate(year, month, day).to_gregorian()
            return datetime(gregorian.year, gregorian.month, gregorian.day)
        except Exception as e:
            logger.error(f"Error converting Jalali date to Gregorian: {e}")
            return None

    @staticmethod
    def _is_nira_test_city(city: Any) -> bool:
        """
        Nira often ships dummy route rows labeled "(Test)" (e.g. UGT, TTQ)
        for IBE sandbox — not real Nasim destinations.
        """
        if not isinstance(city, dict):
            return False
        code = str(city.get('CITY') or '').strip().upper()
        if code in {'UGT', 'TTQ'}:
            return True
        name_en = str(city.get('CITYNAME_EN') or '')
        name_fa = str(city.get('CITYNAME_FA') or '')
        blob = f'{name_en} {name_fa}'.lower()
        return '(test)' in blob or 'تست' in name_fa

    def _strip_test_route_cities(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Remove Nira test cities from RoutesApp payloads before returning to clients."""
        if not result.get('success'):
            return result
        data = result.get('data')
        if not isinstance(data, dict):
            return result
        cities = data.get('NRSRoutesApp')
        if not isinstance(cities, list):
            return result
        cleaned = [c for c in cities if not self._is_nira_test_city(c)]
        if len(cleaned) == len(cities):
            return result
        out = dict(result)
        out_data = dict(data)
        out_data['NRSRoutesApp'] = cleaned
        out['data'] = out_data
        return out

    def _encode_office_pass(self) -> str:
        import base64
        now = datetime.now()
        pattern = f"{self.office_user}_{now.strftime('%Y-%m-%d %H:%M:%S')}"
        return base64.b64encode(pattern.encode('utf-8')).decode('utf-8')

    @staticmethod
    def _is_test_airport_code(code: str) -> bool:
        return str(code or '').strip().upper() in {'UGT', 'TTQ'}

    def _strip_test_schedule_flights(self, result: Dict[str, Any]) -> Dict[str, Any]:
        if not result.get('success'):
            return result
        data = result.get('data')
        if not isinstance(data, dict):
            return result
        rows = data.get('NRSFlights')
        if not isinstance(rows, list):
            return result
        cleaned = []
        for row in rows:
            if not isinstance(row, dict):
                continue
            origin = str(row.get('Origin') or '').strip().upper()
            dest = str(row.get('Destination') or '').strip().upper()
            if self._is_test_airport_code(origin) or self._is_test_airport_code(dest):
                continue
            cleaned.append(row)
        if len(cleaned) == len(rows):
            return result
        out = dict(result)
        out_data = dict(data)
        out_data['NRSFlights'] = cleaned
        out['data'] = out_data
        return out

    def get_flights_in_range(
        self,
        from_date: datetime,
        to_date: datetime,
        use_cache: bool = True,
    ) -> Dict[str, Any]:
        """
        All Nasim scheduled flights in a date range (Nira ADVANCED doc).

        GET ws1/NRSCWS.jsp?ModuleType=SP&ModuleName=Flights&FromDate=&ToDate=
        Response: { "NRSFlights": [ { Origin, Destination, DepartureDateTime, FlightNo }, ... ] }
        """
        from nasim.cache_utils import cache_get, cache_key as shared_cache_key

        from_s = from_date.strftime('%Y-%m-%d')
        to_s = to_date.strftime('%Y-%m-%d')
        shared_key = shared_cache_key('nira_flights', from_s, to_s)
        local_key = self._generate_cache_key('get_flights_in_range', from_date=from_s, to_date=to_s)

        if use_cache:
            shared = cache_get(shared_key)
            if shared and isinstance(shared, dict):
                return self._strip_test_schedule_flights(shared)
            if local_key in self._routes_cache:
                return self._strip_test_schedule_flights(self._routes_cache[local_key])

        if not self.ws_url:
            return {'success': False, 'error': 'Nira Web Service URL is not configured'}
        if not self.office_user:
            return {'success': False, 'error': 'Nira Office credentials are not configured'}

        def _fetch() -> Dict[str, Any]:
            params = {
                'ModuleType': 'SP',
                'ModuleName': 'Flights',
                'FromDate': from_s,
                'ToDate': to_s,
                'OfficeUser': self.office_user,
                'OfficePass': self._encode_office_pass(),
            }
            try:
                response = self._http_get(self.ws_url, params=params)
                if response.status_code != 200:
                    return {
                        'success': False,
                        'error': f'API returned status code {response.status_code}',
                        'status_code': response.status_code,
                        'response': (response.text or '')[:500],
                    }
                text = (response.text or '').strip()
                # SIGN here usually means this OfficeUser is not allowed for ModuleName=Flights
                # (RoutesApp/Availability may still work with the same credentials).
                if text == 'SIGN' or text.upper() == 'SIGN':
                    unsupported = {
                        'success': False,
                        'supported': False,
                        'code': 'NIRA_FLIGHTS_UNSUPPORTED',
                        'error': (
                            'Nira Flights module not enabled for this OfficeUser (got SIGN). '
                            'Fall back to RoutesApp + Availability.'
                        ),
                        'status_code': response.status_code,
                    }
                    # Cache negative so map/search do not hammer Nira on every request
                    self._routes_cache[local_key] = unsupported
                    self._store_fresh_and_stale(shared_key, unsupported, min(120, self.routes_cache_ttl))
                    return unsupported
                try:
                    data = response.json()
                except ValueError:
                    return {
                        'success': False,
                        'error': 'Invalid JSON from Nira Flights module',
                        'response': text[:500],
                    }
                if isinstance(data, str) and data.strip().upper() == 'SIGN':
                    return {
                        'success': False,
                        'supported': False,
                        'code': 'NIRA_FLIGHTS_UNSUPPORTED',
                        'error': 'Nira Flights module not enabled for this OfficeUser (got SIGN).',
                    }
                # Normalize list under NRSFlights
                if isinstance(data, list):
                    data = {'NRSFlights': data}
                elif isinstance(data, dict) and 'NRSFlights' not in data:
                    # Some tenants nest differently
                    for key in ('Flights', 'flights', 'Data'):
                        if isinstance(data.get(key), list):
                            data = {'NRSFlights': data[key]}
                            break
                result = {
                    'success': True,
                    'data': data if isinstance(data, dict) else {'NRSFlights': []},
                    'status_code': response.status_code,
                    'from_date': from_s,
                    'to_date': to_s,
                }
                self._routes_cache[local_key] = result
                self._store_fresh_and_stale(shared_key, result, self.routes_cache_ttl)
                return self._strip_test_schedule_flights(result)
            except requests.exceptions.Timeout:
                return {
                    'success': False,
                    'error': f'Request timeout - Nira Flights module ({self.timeout}s)',
                }
            except requests.exceptions.ConnectionError:
                return {'success': False, 'error': 'Connection error - Could not connect to Nira API'}
            except Exception as e:
                logger.error('Error calling Nira Flights module: %s', e)
                return {'success': False, 'error': f'Unexpected error: {e}'}

        try:
            result = nira_guarded(_fetch, coalesce_key=f'flights:{from_s}:{to_s}')
        except (CircuitOpenError, OverloadedError) as exc:
            stale = self._serve_stale(shared_key, type(exc).__name__)
            if stale:
                return self._strip_test_schedule_flights(stale)
            return nira_soft_error(exc)

        if not result.get('success'):
            stale = self._serve_stale(shared_key, result.get('error') or 'nira_error')
            if stale:
                return self._strip_test_schedule_flights(stale)
        return result

    def get_route_network(self, days_ahead: int = 14) -> Dict[str, Any]:
        """
        Build origin/destination graph from ModuleName=Flights over [today, today+days].
        Used so search + map see every Nasim OD that actually has scheduled flights.
        """
        days = max(1, min(int(days_ahead or 14), 30))
        start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=days)
        schedule = self.get_flights_in_range(start, end)
        if not schedule.get('success'):
            # Preserve unsupported flag for callers that want to skip merge
            return schedule

        rows = []
        data = schedule.get('data') or {}
        if isinstance(data, dict):
            rows = data.get('NRSFlights') or []
        origins: Dict[str, Dict[str, str]] = {}
        dest_map: Dict[str, Dict[str, Dict[str, str]]] = {}
        for row in rows:
            if not isinstance(row, dict):
                continue
            o = str(row.get('Origin') or '').strip().upper()
            d = str(row.get('Destination') or '').strip().upper()
            if not o or not d or o == d:
                continue
            if o not in origins:
                origins[o] = {
                    'CITY': o,
                    'CITYNAME_FA': o,
                    'CITYNAME_EN': o,
                    'isDomestic': '1',
                }
            if d not in origins:
                origins[d] = {
                    'CITY': d,
                    'CITYNAME_FA': d,
                    'CITYNAME_EN': d,
                    'isDomestic': '1',
                }
            dest_map.setdefault(o, {})
            dest_map[o][d] = {
                'CITY': d,
                'CITYNAME_FA': d,
                'CITYNAME_EN': d,
                'isDomestic': '1',
            }

        return {
            'success': True,
            'data': {
                'origins': list(origins.values()),
                'destinations_by_origin': {
                    origin: list(dests.values()) for origin, dests in dest_map.items()
                },
                'flight_count': len(rows),
                'from_date': start.strftime('%Y-%m-%d'),
                'to_date': end.strftime('%Y-%m-%d'),
            },
            'status_code': schedule.get('status_code', 200),
        }

    @staticmethod
    def _parse_money(value: Any) -> int:
        text = str(value or '').strip().replace(',', '')
        if not text or text in {'-', 'None'}:
            return 0
        try:
            amount = float(text)
        except ValueError:
            return 0
        if amount <= 0:
            return 0
        return int(amount)

    def _quote_adult_fare(
        self,
        *,
        origin: str,
        destination: str,
        departure_date: str,
        flight_no: str,
        rbd: str,
        airline: str,
    ) -> int:
        """
        Nira FareJS adult total for one flight and class.
        Documented as FareJS.jsp with Route, RBD, DepartureDate and FlightNO.
        Returns 0 when Nira has no fare. Does not reserve or open a sale.
        """
        from nasim.cache_utils import cache_get, cache_set, cache_key

        rbd = (rbd or '').strip().upper()
        if not rbd or not self.base_url or not self.office_user:
            return 0
        key = cache_key(
            'nira_fare',
            (airline or 'NSN').upper(),
            origin,
            destination,
            departure_date,
            flight_no,
            rbd,
        )
        cached = cache_get(key)
        if isinstance(cached, int) and cached > 0:
            return cached

        import base64
        stamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        token = base64.b64encode(f'{self.office_user}_{stamp}'.encode('utf-8')).decode('utf-8')
        try:
            response = self._http_get(
                f"{self.base_url.rstrip('/')}/ws1/FareJS.jsp",
                params={
                    'AirLine': airline or 'NSN',
                    'Route': f'{origin}-{destination}',
                    'RBD': rbd,
                    'DepartureDate': departure_date,
                    'FlightNO': flight_no,
                    'OfficeUser': self.office_user,
                    'OfficePass': token,
                },
                headers={'Accept': 'application/json'},
                read_timeout=8,
            )
            data = response.json()
        except Exception as exc:
            logger.warning(
                'Nira fare quote failed for flight %s class %s: %s',
                flight_no,
                rbd,
                type(exc).__name__,
            )
            return 0
        if not isinstance(data, dict):
            return 0
        amount = self._parse_money(data.get('AdultTotalPrice'))
        if amount > 0:
            cache_set(key, amount, 300)
        return amount

    def _fill_missing_display_fares(self, data: Dict[str, Any]) -> None:
        """
        Availability can list a closed class at price 0 while FareJS still has
        the adult fare, usually on class Y. Copy that number onto the card.
        AllowReservation is forced false so the row still cannot be sold.
        """
        flights = data.get('AvailableFlights')
        if not isinstance(flights, list):
            return
        quotes = 0
        limit = 8
        for flight in flights:
            if quotes >= limit or not isinstance(flight, dict):
                continue
            status = str(flight.get('FlightStatus') or '').strip().upper()
            if status in {'X', 'CANCELLED', 'CNL'}:
                continue
            classes = flight.get('ClassStatus')
            if classes is None:
                classes = []
                flight['ClassStatus'] = classes
            if not isinstance(classes, list):
                continue
            if any(
                isinstance(row, dict) and self._parse_money(row.get('TotalPrice')) > 0
                for row in classes
            ):
                continue
            origin = str(flight.get('Origin') or '').strip().upper()
            destination = str(flight.get('Destination') or '').strip().upper()
            departure = str(flight.get('DepartureDateTime') or '')[:10]
            flight_no = str(flight.get('FlightNo') or flight.get('FlightNumber') or '').strip()
            airline = str(flight.get('AirLineCode') or 'NSN').strip() or 'NSN'
            if not (origin and destination and len(departure) == 10 and flight_no):
                continue

            def quote(letter: str) -> int:
                nonlocal quotes
                if quotes >= limit:
                    return 0
                quotes += 1
                return self._quote_adult_fare(
                    origin=origin,
                    destination=destination,
                    departure_date=departure,
                    flight_no=flight_no,
                    rbd=letter,
                    airline=airline,
                )

            if not classes:
                amount = quote('Y')
                if amount <= 0:
                    continue
                classes.append({
                    'CabinClass': 'Economy Class',
                    'CurrencyCode': 'IRR',
                    'Status': 'C',
                    'TotalPrice': amount,
                    'ClassName': 'Y',
                    'Refundable': True,
                    'AllowReservation': False,
                })
                logger.info('Display fare filled for flight %s from class Y', flight_no)
                continue

            for row in classes:
                if quotes >= limit or not isinstance(row, dict):
                    continue
                if self._parse_money(row.get('TotalPrice')) > 0:
                    continue
                letters = []
                own = str(row.get('ClassName') or '').strip().upper()
                if own:
                    letters.append(own)
                if 'Y' not in letters:
                    letters.append('Y')
                amount = 0
                for letter in letters:
                    amount = quote(letter)
                    if amount > 0:
                        break
                if amount <= 0:
                    continue
                row['TotalPrice'] = amount
                row['AllowReservation'] = False
                logger.info('Display fare filled for flight %s', flight_no)

    def check_availability(
        self,
        origin: str,
        destination: str,
        departure_date: datetime,
        round_trip: bool = False,
        return_date: Optional[datetime] = None,
        adult_qty: int = 1,
        child_qty: int = 0,
        infant_qty: int = 0,
        use_cache: bool = True,
        fill_display_fares: bool = True,
    ) -> Dict[str, Any]:
        """
        Check flight availability using Nira IBE API
        طبق مستندات: GET /ibe/Availability با QueryString
        تلاش می‌کنیم با header های مناسب JSON بگیریم
        
        Args:
            origin: Origin airport IATA code (e.g., 'THR')
            destination: Destination airport IATA code (e.g., 'MHD')
            departure_date: Departure date as datetime object
            round_trip: Whether it's a round trip (default: False)
            return_date: Return date as datetime object (required if round_trip=True)
            adult_qty: Number of adults (default: 1)
            child_qty: Number of children (default: 0)
            infant_qty: Number of infants (default: 0)
            
        Returns:
            Dictionary containing API response or error information
            
        Example:
            result = client.check_availability(
                origin='THR',
                destination='MHD',
                departure_date=datetime(2023, 11, 4),
                round_trip=True,
                return_date=datetime(2023, 11, 6),
                adult_qty=1
            )
        """
        if not self.base_url:
            return {
                'success': False,
                'error': 'Nira Base URL is not configured'
            }
        
        if not self.office_user:
            return {
                'success': False,
                'error': 'Nira Office credentials are not configured'
            }

        # Short shared cache — absorbs search spikes without serving stale inventory for long
        from nasim.cache_utils import cache_get, cache_set, cache_key as shared_cache_key
        avail_key = shared_cache_key(
            'nira_avail',
            origin.upper(),
            destination.upper(),
            departure_date.date().isoformat(),
            (return_date.date().isoformat() if return_date else 'oneway'),
            adult_qty,
            child_qty,
            infant_qty,
            int(bool(round_trip)),
        )
        if use_cache and self.availability_cache_ttl > 0:
            cached = cache_get(avail_key)
            if cached and isinstance(cached, dict):
                logger.info('Nira availability cache HIT')
                return cached

        def _fetch() -> Dict[str, Any]:
            # Convert dates to Jalali format
            departure_date_jalali = self._convert_to_jalali(departure_date)
            return_date_jalali = None
            if round_trip and return_date:
                return_date_jalali = self._convert_to_jalali(return_date)

            import base64
            now = datetime.now()
            office_pass_pattern = f"{self.office_user}_{now.strftime('%Y-%m-%d %H:%M:%S')}"
            office_pass_encoded = base64.b64encode(office_pass_pattern.encode('utf-8')).decode('utf-8')

            params = {
                'origin': origin.upper(),
                'destination': destination.upper(),
                'departureDate': departure_date_jalali,
                'roundTrip': 'true' if round_trip else 'false',
                'adultQty': adult_qty,
                'childQty': child_qty,
                'infantQty': infant_qty,
                'OfficeUser': self.office_user,
                'OfficePass': office_pass_encoded,
            }
            if round_trip and return_date_jalali:
                params['returnDate'] = return_date_jalali

            # Primary gets most of the budget; fallback uses a short remainder — never 2× timeout
            primary_read = max(5, int(self.timeout * 0.7))
            fallback_read = max(4, int(self.timeout - primary_read))

            try:
                response = self._http_get(
                    f"{self.base_url}/ibe/Availability",
                    params=params,
                    headers={
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    read_timeout=primary_read,
                    allow_redirects=True,
                )

                content_type = response.headers.get('Content-Type', '').lower()
                if 'application/json' in content_type or response.text.strip().startswith('{'):
                    try:
                        data = response.json()
                        result = {
                            'success': True,
                            'data': data,
                            'status_code': response.status_code,
                        }
                        if fill_display_fares and isinstance(data, dict):
                            try:
                                self._fill_missing_display_fares(data)
                            except Exception as exc:
                                logger.warning('Display fare fill skipped: %s', type(exc).__name__)
                        if use_cache and fill_display_fares and self.availability_cache_ttl > 0:
                            cache_set(avail_key, result, self.availability_cache_ttl)
                        return result
                    except ValueError:
                        pass

                if response.status_code == 200 and (
                    'text/html' in content_type or response.text.strip().startswith('<!')
                ):
                    logger.warning('Received HTML from /ibe/Availability, trying fallback endpoint')
                    result = self._check_availability_fallback(
                        origin, destination, departure_date, round_trip, return_date,
                        adult_qty, child_qty, infant_qty, departure_date_jalali,
                        return_date_jalali, office_pass_encoded,
                        read_timeout=fallback_read,
                    )
                    if fill_display_fares and result.get('success') and isinstance(result.get('data'), dict):
                        try:
                            self._fill_missing_display_fares(result['data'])
                        except Exception as exc:
                            logger.warning('Display fare fill skipped: %s', type(exc).__name__)
                    fallback_flights = []
                    if isinstance(result.get('data'), dict):
                        fallback_flights = result['data'].get('AvailableFlights') or []
                    if (
                        result.get('success')
                        and fallback_flights
                        and use_cache
                        and fill_display_fares
                        and self.availability_cache_ttl > 0
                    ):
                        cache_set(avail_key, result, self.availability_cache_ttl)
                    return result

                result = {
                    'success': True,
                    'data': response.text,
                    'status_code': response.status_code,
                    'content_type': content_type,
                }
                if use_cache and fill_display_fares and self.availability_cache_ttl > 0:
                    cache_set(avail_key, result, self.availability_cache_ttl)
                return result

            except requests.exceptions.Timeout:
                return {
                    'success': False,
                    'error': f'Request timeout - Nira API did not respond in {self.timeout} seconds.',
                }
            except requests.exceptions.ConnectionError:
                return {
                    'success': False,
                    'error': 'Connection error - Could not connect to Nira API',
                }
            except Exception as e:
                logger.error(f'Error calling Nira Availability API: {e}')
                return {
                    'success': False,
                    'error': f'Unexpected error: {str(e)}',
                }

        try:
            return nira_guarded(_fetch, coalesce_key=f'avail:{avail_key}')
        except (CircuitOpenError, OverloadedError) as exc:
            return nira_soft_error(exc)
    
    def _check_availability_fallback(
        self,
        origin: str,
        destination: str,
        departure_date: datetime,
        round_trip: bool,
        return_date: Optional[datetime],
        adult_qty: int,
        child_qty: int,
        infant_qty: int,
        departure_date_jalali: str,
        return_date_jalali: Optional[str],
        office_pass_encoded: str,
        read_timeout: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Fallback method: Use /api/Res/FlightAvailability if /ibe/Availability returns HTML
        """
        if not self.api_url:
            return {
                'success': False,
                'error': 'Nira API URL is not configured for fallback'
            }
        
        # Build query parameters for URL (OfficeUser and OfficePass)
        query_params = {
            'OfficeUser': self.office_user,
            'OfficePass': office_pass_encoded,
        }
        
        # Build request body as JSON (with correct field names)
        json_data = {
            'Origin': origin.upper(),
            'Destination': destination.upper(),
            'Date': departure_date_jalali,
            'AdultNo': adult_qty,
            'ChildNo': child_qty,
            'InfantNo': infant_qty,
            # Prefer domestic; Availability IBE path is primary. Fallback used when IBE returns HTML.
            'isForeign': False,
        }
        
        # Add round trip fields if needed
        if round_trip:
            json_data['roundTrip'] = True
            if return_date_jalali:
                json_data['ReturnDate'] = return_date_jalali
        else:
            json_data['roundTrip'] = False
        
        try:
            # Log request details for debugging
            logger.info(f"🔍 Nira API Request URL: {self.api_url}/FlightAvailability")
            logger.info(f"🔍 Nira API Query Params: {query_params}")
            logger.info(f"🔍 Nira API JSON Body: {json_data}")
            
            # Make POST request to Nira API with JSON body
            response = self._http_post(
                f"{self.api_url}/FlightAvailability",
                params=query_params,
                json=json_data,
                headers={
                    'Content-Type': 'application/json',
                    'Accept': 'application/json, text/plain, */*',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                read_timeout=read_timeout if read_timeout is not None else max(4, int(self.timeout * 0.4)),
                allow_redirects=True,
            )
            
            # Log response details for debugging
            logger.info(f"🔍 Nira API Response Status: {response.status_code}")
            logger.info(f"🔍 Nira API Response Headers: {dict(response.headers)}")
            
            # Check response status
            if response.status_code == 200:
                try:
                    # Try to parse JSON response
                    data = response.json()
                    logger.info(f"🔍 Nira API Response Data (first 500 chars): {str(data)[:500]}")
                    # Log TotalPrice from first flight if available
                    if isinstance(data, dict) and 'AvailableFlights' in data:
                        flights = data.get('AvailableFlights', [])
                        if flights and len(flights) > 0:
                            first_flight = flights[0]
                            if 'ClassStatus' in first_flight and len(first_flight['ClassStatus']) > 0:
                                first_class = first_flight['ClassStatus'][0]
                                logger.info(f"🔍 First Flight TotalPrice: {first_class.get('TotalPrice', 'N/A')}")
                    return {
                        'success': True,
                        'data': data,
                        'status_code': response.status_code
                    }
                except ValueError:
                    # If not JSON, return text response
                    return {
                        'success': True,
                        'data': response.text,
                        'status_code': response.status_code,
                        'content_type': response.headers.get('Content-Type', '')
                    }
            else:
                # Log the actual URL and response for debugging
                return {
                    'success': False,
                    'error': f'API returned status code {response.status_code}',
                    'status_code': response.status_code,
                    'url': response.url,  # Show the actual URL called
                    'request_url': f"{self.api_url}/FlightAvailability",  # Show what we tried to call
                    'base_url': self.base_url,  # Show base URL
                    'api_url': self.api_url,  # Show API URL
                    'response': response.text[:500]  # First 500 chars
                }
                
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'error': f'Request timeout - Nira API did not respond in {self.timeout} seconds. The API might be slow or unavailable.'
            }
        except requests.exceptions.ConnectionError:
            return {
                'success': False,
                'error': 'Connection error - Could not connect to Nira API'
            }
        except Exception as e:
            logger.error(f"Error calling Nira Availability API: {e}")
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}'
            }
    
    def _generate_cache_key(self, method: str, **kwargs) -> str:
        """
        Generate a unique cache key based on method name and parameters
        """
        key_parts = [method]
        for k, v in sorted(kwargs.items()):
            key_parts.append(f"{k}={v}")
        key_string = "|".join(key_parts)
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def suggest_related_flights(
        self,
        origin: str,
        destination: str,
        departure_date: datetime,
    ) -> Dict[str, Any]:
        """
        Nearby Nasim flights for the results page.

        Two groups, both display-only:
        - the same route and the reverse route on later days
        - other destinations from the same origin on the searched day and the days after

        Availability lookups stay capped and fare quotes stay off the shared
        availability cache so a suggestion scan cannot wipe a real search price.
        """
        import time

        from nasim.cache_utils import cache_get, cache_set, cache_key as shared_cache_key

        origin_u = (origin or '').strip().upper()
        dest_u = (destination or '').strip().upper()
        day = departure_date.date()
        empty = {
            'success': True,
            'alternate': [],
            'other_destinations': [],
            'sale_closed': True,
        }
        if not origin_u or not dest_u or origin_u == dest_u:
            return empty

        cache_id = shared_cache_key('nira_suggest_v4', origin_u, dest_u, day.isoformat())
        cached = cache_get(cache_id)
        if isinstance(cached, dict) and cached.get('success'):
            return cached

        names: Dict[str, Dict[str, str]] = {}

        def remember(rows: Any) -> None:
            if not isinstance(rows, list):
                return
            for row in rows:
                if not isinstance(row, dict) or self._is_nira_test_city(row):
                    continue
                code = str(row.get('CITY') or '').strip().upper()
                if not code:
                    continue
                names[code] = {
                    'fa': str(row.get('CITYNAME_FA') or code),
                    'en': str(row.get('CITYNAME_EN') or code),
                }

        origins_result = self.get_origin_cities()
        if isinstance(origins_result, dict) and origins_result.get('success'):
            remember((origins_result.get('data') or {}).get('NRSRoutesApp'))

        other_codes: List[str] = []
        dest_result = self.get_destinations(origin_u)
        if isinstance(dest_result, dict) and dest_result.get('success'):
            rows = (dest_result.get('data') or {}).get('NRSRoutesApp') or []
            remember(rows)
            for row in rows:
                if not isinstance(row, dict) or self._is_nira_test_city(row):
                    continue
                code = str(row.get('CITY') or '').strip().upper()
                if code and code not in {origin_u, dest_u} and code not in other_codes:
                    other_codes.append(code)
        other_codes = other_codes[:4]

        def city_names(code: str) -> Dict[str, str]:
            found = names.get(code) or {}
            return {'fa': found.get('fa') or code, 'en': found.get('en') or code}

        def price_of(flight: Dict[str, Any]) -> int:
            best = 0
            classes = flight.get('ClassStatus') or []
            if isinstance(classes, list):
                for row in classes:
                    if isinstance(row, dict):
                        best = max(best, self._parse_money(row.get('TotalPrice')))
            return best

        def clock_of(value: Any) -> str:
            text = str(value or '')
            for sep in ('T', ' '):
                if sep in text:
                    rest = text.split(sep, 1)[1]
                    if len(rest) >= 5 and rest[2] == ':':
                        return rest[:5]
            return ''

        def cards_from(result: Dict[str, Any], direction: str, queried) -> List[Dict[str, Any]]:
            data = result.get('data') if isinstance(result, dict) else None
            flights = data.get('AvailableFlights') if isinstance(data, dict) else None
            if not isinstance(flights, list):
                return []
            found: List[Dict[str, Any]] = []
            for flight in flights:
                if not isinstance(flight, dict):
                    continue
                status = str(flight.get('FlightStatus') or '').strip().upper()
                if status in {'X', 'CANCELLED', 'CNL'}:
                    continue
                flight_no = str(flight.get('FlightNo') or flight.get('FlightNumber') or '').strip()
                flight_origin = str(flight.get('Origin') or '').strip().upper()
                flight_dest = str(flight.get('Destination') or '').strip().upper()
                if not flight_no or not flight_origin or not flight_dest:
                    continue
                dep_raw = str(flight.get('DepartureDateTime') or '')
                date_iso = dep_raw[:10] if len(dep_raw) >= 10 and dep_raw[4] == '-' else queried.isoformat()
                if (
                    direction != 'other'
                    and date_iso == day.isoformat()
                    and flight_origin == origin_u
                    and flight_dest == dest_u
                ):
                    continue
                origin_name = city_names(flight_origin)
                dest_name = city_names(flight_dest)
                found.append({
                    'direction': 'reverse' if direction == 'reverse' else ('other' if direction == 'other' else 'same'),
                    'origin': flight_origin,
                    'destination': flight_dest,
                    'origin_fa': origin_name['fa'],
                    'origin_en': origin_name['en'],
                    'destination_fa': dest_name['fa'],
                    'destination_en': dest_name['en'],
                    'date': date_iso,
                    'flight_no': flight_no,
                    'departure_time': clock_of(dep_raw),
                    'arrival_time': clock_of(flight.get('ArrivalDateTime')),
                    'price': price_of(flight),
                    'can_book': False,
                    '_flight': flight,
                })
            return found

        def fetch(item):
            direction, route_origin, route_dest, when = item
            try:
                result = self.check_availability(
                    origin=route_origin,
                    destination=route_dest,
                    departure_date=datetime.combine(when, datetime.min.time()),
                    use_cache=True,
                    fill_display_fares=False,
                )
            except Exception as exc:
                logger.warning('Suggestion availability skipped: %s', type(exc).__name__)
                result = {'success': False}
            return direction, result if isinstance(result, dict) else {'success': False}, when

        today = datetime.now().date()
        route_offsets = [1, -1, 2, 3, 4, 5, 6, 7, -2]
        route_lookups = []
        for offset in route_offsets:
            when = day + timedelta(days=offset)
            if when < today or when == day:
                continue
            route_lookups.append(('same', origin_u, dest_u, when))
            route_lookups.append(('reverse', dest_u, origin_u, when))
        other_lookups = [('other', origin_u, code, day) for code in other_codes]
        other_lookups.extend(
            ('other', origin_u, code, day + timedelta(days=1))
            for code in other_codes[:3]
            if day + timedelta(days=1) >= today
        )

        gathered = []
        timed_out = False

        def has_flights(result: Dict[str, Any]) -> bool:
            data = result.get('data') if isinstance(result, dict) else None
            flights = data.get('AvailableFlights') if isinstance(data, dict) else None
            return isinstance(flights, list) and len(flights) > 0

        def run_until(items: List[tuple], deadline: float, stop_after: int) -> None:
            nonlocal timed_out
            found = 0
            for item in items:
                if time.monotonic() > deadline:
                    timed_out = True
                    return
                direction, result, when = fetch(item)
                gathered.append((direction, result, when))
                if has_flights(result):
                    found += 1
                if found >= stop_after:
                    return

        # Same route and the return come first, so a slow city scan cannot hide them.
        run_until(route_lookups, time.monotonic() + 14, stop_after=6)
        run_until(other_lookups, time.monotonic() + 8, stop_after=4)

        alternate: List[Dict[str, Any]] = []
        other: List[Dict[str, Any]] = []
        seen = set()
        for direction, result, when in gathered:
            for card in cards_from(result, direction, when):
                key = (card['date'], card['origin'], card['destination'], card['flight_no'])
                if key in seen:
                    continue
                seen.add(key)
                if direction == 'other':
                    other.append(card)
                else:
                    alternate.append(card)

        alternate.sort(key=lambda card: (card['date'], 0 if card['direction'] == 'same' else 1, card['departure_time']))
        other.sort(key=lambda card: (card['date'], card['destination'], card['departure_time']))
        alternate = alternate[:8]
        other = other[:8]

        quote_flights = []
        for card in alternate + other:
            flight = card.get('_flight')
            if card['price'] <= 0 and isinstance(flight, dict):
                quote_flights.append(flight)
        if quote_flights:
            try:
                self._fill_missing_display_fares({'AvailableFlights': quote_flights[:4]})
            except Exception as exc:
                logger.warning('Suggestion fare fill skipped: %s', type(exc).__name__)
            for card in alternate + other:
                flight = card.get('_flight')
                if isinstance(flight, dict):
                    card['price'] = price_of(flight)

        for card in alternate + other:
            card.pop('_flight', None)
            card['can_book'] = False

        payload = {
            'success': True,
            'alternate': alternate,
            'other_destinations': other,
            'sale_closed': True,
        }
        cache_set(cache_id, payload, 45 if timed_out else 120)
        return payload

    def get_origin_cities(self, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Get list of origin cities from Nira Routes API
        Shared Redis/LocMem cache (all Gunicorn workers) + process TTL fallback.
        On Nira outage, serve stale cache so the SPA still loads.
        """
        from nasim.cache_utils import cache_get, cache_key as shared_cache_key

        shared_key = shared_cache_key('nira_origins')
        local_key = self._generate_cache_key('get_origin_cities')

        if not force_refresh:
            shared = cache_get(shared_key)
            if shared and isinstance(shared, dict):
                logger.info('Origin cities shared-cache HIT')
                return self._strip_test_route_cities(shared)
            if local_key in self._routes_cache:
                logger.info('Origin cities process-cache HIT')
                return self._strip_test_route_cities(self._routes_cache[local_key])
        
        logger.info('Origin cities cache MISS — fetching Nira')
        
        if not self.ws_url:
            return {
                'success': False,
                'error': 'Nira Web Service URL is not configured'
            }
        
        if not self.office_user:
            return {
                'success': False,
                'error': 'Nira Office credentials are not configured'
            }

        def _fetch() -> Dict[str, Any]:
            import base64
            now = datetime.now()
            office_pass_pattern = f"{self.office_user}_{now.strftime('%Y-%m-%d %H:%M:%S')}"
            office_pass_encoded = base64.b64encode(office_pass_pattern.encode('utf-8')).decode('utf-8')

            params = {
                'ModuleType': 'SP',
                'ModuleName': 'RoutesApp',
                'Origin': '',
                'OfficeUser': self.office_user,
                'OfficePass': office_pass_encoded,
            }

            try:
                response = self._http_get(self.ws_url, params=params)

                if response.status_code == 200:
                    try:
                        data = response.json()
                        if isinstance(data, str) and data.strip() == 'SIGN':
                            return {
                                'success': False,
                                'error': 'Authentication failed - OfficePass might be incorrect or expired. Check OfficeUser and OfficePass.',
                                'status_code': response.status_code,
                                'url': response.url,
                                'office_user': self.office_user,
                                'debug': 'Response was "SIGN" which indicates authentication failure',
                            }
                        result = {
                            'success': True,
                            'data': data,
                            'status_code': response.status_code,
                        }
                        self._routes_cache[local_key] = result
                        self._store_fresh_and_stale(shared_key, result, self.routes_cache_ttl)
                        logger.info('Cached origin cities')
                        return self._strip_test_route_cities(result)
                    except ValueError:
                        if response.text.strip() == 'SIGN':
                            return {
                                'success': False,
                                'error': 'Authentication failed - OfficePass might be incorrect or expired. Check OfficeUser and OfficePass.',
                                'status_code': response.status_code,
                                'url': response.url,
                                'office_user': self.office_user,
                                'debug': 'Response was "SIGN" which indicates authentication failure',
                            }
                        result = {
                            'success': True,
                            'data': response.text,
                            'status_code': response.status_code,
                            'content_type': response.headers.get('Content-Type', ''),
                        }
                        self._routes_cache[local_key] = result
                        self._store_fresh_and_stale(shared_key, result, self.routes_cache_ttl)
                        logger.info('Cached origin cities (text format)')
                        return self._strip_test_route_cities(result)
                return {
                    'success': False,
                    'error': f'API returned status code {response.status_code}',
                    'status_code': response.status_code,
                    'response': response.text[:500],
                }

            except requests.exceptions.Timeout:
                return {
                    'success': False,
                    'error': f'Request timeout - Nira API did not respond in {self.timeout} seconds. The API might be slow or unavailable.',
                    'timeout': self.timeout,
                    'url': self.ws_url,
                }
            except requests.exceptions.ConnectionError:
                return {
                    'success': False,
                    'error': 'Connection error - Could not connect to Nira API',
                }
            except Exception as e:
                logger.error(f'Error calling Nira Routes API (origin cities): {e}')
                return {
                    'success': False,
                    'error': f'Unexpected error: {str(e)}',
                }

        try:
            result = nira_guarded(_fetch, coalesce_key='origins')
        except (CircuitOpenError, OverloadedError) as exc:
            stale = self._serve_stale(shared_key, type(exc).__name__)
            if stale:
                return self._strip_test_route_cities(stale)
            return nira_soft_error(exc)

        if not result.get('success'):
            stale = self._serve_stale(shared_key, result.get('error') or 'nira_error')
            if stale:
                return self._strip_test_route_cities(stale)
        return result
    
    def get_destinations(self, origin: str) -> Dict[str, Any]:
        """
        Get list of flight destinations from a specific origin
        Shared Redis/LocMem cache + process TTL fallback + stale on outage.
        """
        from nasim.cache_utils import cache_get, cache_key as shared_cache_key

        origin_u = origin.upper()
        shared_key = shared_cache_key('nira_dest', origin_u)
        cache_key = self._generate_cache_key('get_destinations', origin=origin_u)

        shared = cache_get(shared_key)
        if shared and isinstance(shared, dict):
            logger.info('Destinations shared-cache HIT for %s', origin_u)
            return self._strip_test_route_cities(shared)
        if cache_key in self._routes_cache:
            logger.info('Destinations process-cache HIT for %s', origin_u)
            return self._strip_test_route_cities(self._routes_cache[cache_key])
        
        logger.info('Destinations cache MISS for %s', origin_u)
        
        if not self.ws_url:
            return {
                'success': False,
                'error': 'Nira Web Service URL is not configured'
            }
        
        if not self.office_user:
            return {
                'success': False,
                'error': 'Nira Office credentials are not configured'
            }

        def _fetch() -> Dict[str, Any]:
            import base64
            now = datetime.now()
            office_pass_pattern = f"{self.office_user}_{now.strftime('%Y-%m-%d %H:%M:%S')}"
            office_pass_encoded = base64.b64encode(office_pass_pattern.encode('utf-8')).decode('utf-8')

            params = {
                'ModuleType': 'SP',
                'ModuleName': 'RoutesApp',
                'Origin': origin_u,
                'OfficeUser': self.office_user,
                'OfficePass': office_pass_encoded,
            }

            try:
                response = self._http_get(self.ws_url, params=params)

                if response.status_code == 200:
                    try:
                        data = response.json()
                        result = {
                            'success': True,
                            'data': data,
                            'status_code': response.status_code,
                        }
                        self._routes_cache[cache_key] = result
                        self._store_fresh_and_stale(shared_key, result, self.routes_cache_ttl)
                        logger.info('Cached destinations for %s', origin_u)
                        return self._strip_test_route_cities(result)
                    except ValueError:
                        result = {
                            'success': True,
                            'data': response.text,
                            'status_code': response.status_code,
                            'content_type': response.headers.get('Content-Type', ''),
                        }
                        self._routes_cache[cache_key] = result
                        self._store_fresh_and_stale(shared_key, result, self.routes_cache_ttl)
                        logger.info('Cached destinations for %s (text)', origin_u)
                        return self._strip_test_route_cities(result)
                return {
                    'success': False,
                    'error': f'API returned status code {response.status_code}',
                    'status_code': response.status_code,
                    'response': response.text[:500],
                }

            except requests.exceptions.Timeout:
                return {
                    'success': False,
                    'error': f'Request timeout - Nira API did not respond in {self.timeout} seconds. The API might be slow or unavailable.',
                }
            except requests.exceptions.ConnectionError:
                return {
                    'success': False,
                    'error': 'Connection error - Could not connect to Nira API',
                }
            except Exception as e:
                logger.error(f'Error calling Nira Routes API (destinations): {e}')
                return {
                    'success': False,
                    'error': f'Unexpected error: {str(e)}',
                }

        try:
            result = nira_guarded(_fetch, coalesce_key=f'dest:{origin_u}')
        except (CircuitOpenError, OverloadedError) as exc:
            stale = self._serve_stale(shared_key, type(exc).__name__)
            if stale:
                return self._strip_test_route_cities(stale)
            return nira_soft_error(exc)

        if not result.get('success'):
            stale = self._serve_stale(shared_key, result.get('error') or 'nira_error')
            if stale:
                return self._strip_test_route_cities(stale)
        return result

    # ------------------------------------------------------------------
    # Reservation / payment — NOT in current project Nira docs.
    # Explicit stubs so we never invent fake PNRs.
    # ------------------------------------------------------------------

    def create_reservation(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Placeholder for Nira seat hold / PNR create."""
        reserve_url = getattr(settings, 'NIRA_RESERVE_URL', '').strip()
        if not reserve_url:
            return {
                'success': False,
                'supported': False,
                'code': 'NIRA_RESERVE_UNSUPPORTED',
                'error': 'Nira Reserve/Book API is not configured for this project yet.',
            }
        return {
            'success': False,
            'supported': False,
            'code': 'NIRA_RESERVE_NOT_IMPLEMENTED',
            'error': 'NIRA_RESERVE_URL is set but HTTP client awaits official docs.',
            'url': reserve_url,
        }

    def get_payment_redirect(self, reservation_ref: str, callback_url: str = '', return_url: str = '') -> Dict[str, Any]:
        """
        Build Nira-hosted payment UI URL from NIRA_PAYMENT_REDIRECT_URL template.
        Placeholders: {ref} {callback} {return_url}
        """
        tpl = getattr(settings, 'NIRA_PAYMENT_REDIRECT_URL', '').strip()
        if not tpl:
            return {
                'success': False,
                'supported': False,
                'code': 'NIRA_PAYMENT_UNSUPPORTED',
                'error': 'Nira payment UI redirect is not configured. Using local payment gateways.',
            }
        try:
            url = tpl.format(
                ref=reservation_ref or '',
                callback=callback_url or '',
                return_url=return_url or '',
                amount='',
            )
        except Exception as exc:
            return {'success': False, 'supported': True, 'error': f'Bad NIRA_PAYMENT_REDIRECT_URL: {exc}'}
        return {
            'success': True,
            'supported': True,
            'payment_url': url,
            'provider': 'nira',
        }

    def fetch_paid_reservation(self, reservation_ref: str, session_id: str = '') -> Dict[str, Any]:
        """
        Optional post-payment lookup for PNR / e-tickets.
        Configure NIRA_RESERVATION_LOOKUP_URL with {ref} and optional {session}.
        """
        tpl = getattr(settings, 'NIRA_RESERVATION_LOOKUP_URL', '').strip()
        if not tpl:
            return {'success': False, 'supported': False, 'code': 'NIRA_LOOKUP_UNSUPPORTED'}
        try:
            url = tpl.format(ref=reservation_ref or '', session=session_id or '')
        except Exception as exc:
            return {'success': False, 'error': str(exc)}
        try:
            response = self._http_get(url)
            if response.status_code != 200:
                return {'success': False, 'status_code': response.status_code, 'error': response.text[:300]}
            data = response.json() if 'application/json' in (response.headers.get('Content-Type') or '') else {'raw': response.text}
            # Best-effort extract
            pnr = ''
            tickets = []
            if isinstance(data, dict):
                pnr = str(data.get('PNR') or data.get('pnr') or data.get('ReservationCode') or '')
                t = data.get('tickets') or data.get('TicketNumbers') or data.get('ETickets') or []
                if isinstance(t, list):
                    tickets = [str(x) for x in t]
                elif t:
                    tickets = [str(t)]
            return {'success': True, 'supported': True, 'pnr': pnr, 'tickets': tickets, 'data': data}
        except Exception as exc:
            logger.warning('fetch_paid_reservation failed: %s', exc)
            return {'success': False, 'error': str(exc)}

