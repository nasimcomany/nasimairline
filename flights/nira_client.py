"""
Nira API Client for IBE (Third Generation) Web Site Integration

این فایل برای ارتباط با سیستم نیرا (Nira) استفاده می‌شود.
طبق مستندات: IBE (Third Generation) Web Site Integration
"""
import requests
import logging
from typing import Dict, List, Optional, Any
from django.conf import settings
from datetime import datetime
from persiantools.jdatetime import JalaliDate
from cachetools import TTLCache
import hashlib

logger = logging.getLogger(__name__)


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
        self.timeout = int(getattr(settings, 'NIRA_API_TIMEOUT', 25))
        self.routes_cache_ttl = int(getattr(settings, 'NIRA_ROUTES_CACHE_TTL', 180))
        self.availability_cache_ttl = int(getattr(settings, 'NIRA_AVAILABILITY_CACHE_TTL', 45))
        
        # Process-local fallback if Redis/LocMem glitches mid-request
        self._routes_cache = TTLCache(maxsize=100, ttl=self.routes_cache_ttl)
        
        if not self.base_url:
            logger.warning("NIRA_BASE_URL is not set in settings")
    
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
        
        # Convert dates to Jalali format
        departure_date_jalali = self._convert_to_jalali(departure_date)
        return_date_jalali = None
        if round_trip and return_date:
            return_date_jalali = self._convert_to_jalali(return_date)
        
        # Create OfficePass with current date and time (format: {OfficeUser}_{YYYY-MM-DD HH:MM:SS})
        import base64
        from datetime import datetime
        now = datetime.now()
        office_pass_pattern = f"{self.office_user}_{now.strftime('%Y-%m-%d %H:%M:%S')}"
        office_pass_encoded = base64.b64encode(office_pass_pattern.encode('utf-8')).decode('utf-8')
        
        # Build query parameters طبق مستندات: همه پارامترها در QueryString
        params = {
            'origin': origin.upper(),
            'destination': destination.upper(),
            'departureDate': departure_date_jalali,  # تاریخ شمسی
            'roundTrip': 'true' if round_trip else 'false',
            'adultQty': adult_qty,
            'childQty': child_qty,
            'infantQty': infant_qty,
            'OfficeUser': self.office_user,
            'OfficePass': office_pass_encoded,
        }
        
        # Add return date if round trip
        if round_trip and return_date_jalali:
            params['returnDate'] = return_date_jalali
        
        # First try: GET request طبق مستندات با Accept header برای JSON
        try:
            response = requests.get(
                f"{self.base_url}/ibe/Availability",
                params=params,  # همه پارامترها در QueryString
                headers={
                    'Accept': 'application/json',  # فقط JSON قبول کن
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'X-Requested-With': 'XMLHttpRequest'  # نشان می‌دهد که درخواست AJAX است
                },
                timeout=self.timeout,
                allow_redirects=True
            )
            
            # Check if response is JSON
            content_type = response.headers.get('Content-Type', '').lower()
            if 'application/json' in content_type or response.text.strip().startswith('{'):
                try:
                    data = response.json()
                    result = {
                        'success': True,
                        'data': data,
                        'status_code': response.status_code
                    }
                    if use_cache and self.availability_cache_ttl > 0:
                        cache_set(avail_key, result, self.availability_cache_ttl)
                    return result
                except ValueError:
                    pass  # Fall through to check if it's HTML
            
            # If response is HTML, try fallback to /api/Res/FlightAvailability
            if response.status_code == 200 and ('text/html' in content_type or response.text.strip().startswith('<!')):
                logger.warning("Received HTML from /ibe/Availability, trying fallback endpoint")
                # Fallback: Use the working endpoint
                result = self._check_availability_fallback(
                    origin, destination, departure_date, round_trip, return_date,
                    adult_qty, child_qty, infant_qty, departure_date_jalali, return_date_jalali, office_pass_encoded
                )
                if result.get('success') and use_cache and self.availability_cache_ttl > 0:
                    cache_set(avail_key, result, self.availability_cache_ttl)
                return result
            
            # If not JSON and not HTML, return as is
            result = {
                'success': True,
                'data': response.text,
                'status_code': response.status_code,
                'content_type': content_type
            }
            if use_cache and self.availability_cache_ttl > 0:
                cache_set(avail_key, result, self.availability_cache_ttl)
            return result
            
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'error': f'Request timeout - Nira API did not respond in {self.timeout} seconds.'
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
        office_pass_encoded: str
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
            'isForeign': False,  # False for domestic flights, True for international
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
            response = requests.post(
                f"{self.api_url}/FlightAvailability",
                params=query_params,  # OfficeUser and OfficePass in query string
                json=json_data,  # Flight parameters as JSON in POST body
                headers={
                    'Content-Type': 'application/json',
                    'Accept': 'application/json, text/plain, */*',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout=self.timeout,
                allow_redirects=True
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
    
    def get_origin_cities(self, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Get list of origin cities from Nira Routes API
        Shared Redis/LocMem cache (all Gunicorn workers) + process TTL fallback.
        """
        from nasim.cache_utils import cache_get, cache_set, cache_key as shared_cache_key

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
        
        # Create OfficePass with current date and time (format: {OfficeUser}_{YYYY-MM-DD HH:MM:SS})
        import base64
        from datetime import datetime
        now = datetime.now()
        office_pass_pattern = f"{self.office_user}_{now.strftime('%Y-%m-%d %H:%M:%S')}"
        office_pass_encoded = base64.b64encode(office_pass_pattern.encode('utf-8')).decode('utf-8')
        
        # Build query parameters
        params = {
            'ModuleType': 'SP',
            'ModuleName': 'RoutesApp',
            'Origin': '',  # Empty to get all origin cities (capital O)
            'OfficeUser': self.office_user,
            'OfficePass': office_pass_encoded,  # Use encoded password with date
        }
        
        try:
            response = requests.get(
                self.ws_url,
                params=params,
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    # Check if response is "SIGN" (authentication error)
                    if isinstance(data, str) and data.strip() == "SIGN":
                        return {
                            'success': False,
                            'error': 'Authentication failed - OfficePass might be incorrect or expired. Check OfficeUser and OfficePass.',
                            'status_code': response.status_code,
                            'url': response.url,
                            'office_user': self.office_user,
                            'debug': 'Response was "SIGN" which indicates authentication failure'
                        }
                    # Cache successful response
                    result = {
                        'success': True,
                        'data': data,
                        'status_code': response.status_code
                    }
                    self._routes_cache[local_key] = result
                    cache_set(shared_key, result, self.routes_cache_ttl)
                    logger.info('Cached origin cities')
                    return self._strip_test_route_cities(result)
                except ValueError:
                    # If not JSON, check if it's "SIGN" string
                    if response.text.strip() == "SIGN":
                        return {
                            'success': False,
                            'error': 'Authentication failed - OfficePass might be incorrect or expired. Check OfficeUser and OfficePass.',
                            'status_code': response.status_code,
                            'url': response.url,
                            'office_user': self.office_user,
                            'debug': 'Response was "SIGN" which indicates authentication failure'
                        }
                    # If not JSON, might be XML or HTML
                    result = {
                        'success': True,
                        'data': response.text,
                        'status_code': response.status_code,
                        'content_type': response.headers.get('Content-Type', '')
                    }
                    self._routes_cache[local_key] = result
                    cache_set(shared_key, result, self.routes_cache_ttl)
                    logger.info('Cached origin cities (text format)')
                    return self._strip_test_route_cities(result)
            else:
                return {
                    'success': False,
                    'error': f'API returned status code {response.status_code}',
                    'status_code': response.status_code,
                    'response': response.text[:500]
                }
                
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'error': f'Request timeout - Nira API did not respond in {self.timeout} seconds. The API might be slow or unavailable.',
                'timeout': self.timeout,
                'url': self.ws_url
            }
        except requests.exceptions.ConnectionError:
            return {
                'success': False,
                'error': 'Connection error - Could not connect to Nira API'
            }
        except Exception as e:
            logger.error(f"Error calling Nira Routes API (origin cities): {e}")
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}'
            }
    
    def get_destinations(self, origin: str) -> Dict[str, Any]:
        """
        Get list of flight destinations from a specific origin
        Shared Redis/LocMem cache + process TTL fallback.
        """
        from nasim.cache_utils import cache_get, cache_set, cache_key as shared_cache_key

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
        
        # Create OfficePass with current date and time (format: {OfficeUser}_{YYYY-MM-DD HH:MM:SS})
        import base64
        from datetime import datetime
        now = datetime.now()
        office_pass_pattern = f"{self.office_user}_{now.strftime('%Y-%m-%d %H:%M:%S')}"
        office_pass_encoded = base64.b64encode(office_pass_pattern.encode('utf-8')).decode('utf-8')
        
        # Build query parameters
        params = {
            'ModuleType': 'SP',
            'ModuleName': 'RoutesApp',
            'Origin': origin_u,  # IATA code of origin (capital O)
            'OfficeUser': self.office_user,
            'OfficePass': office_pass_encoded,  # Use encoded password with date
        }
        
        try:
            response = requests.get(
                self.ws_url,
                params=params,
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    # Cache successful response
                    result = {
                        'success': True,
                        'data': data,
                        'status_code': response.status_code
                    }
                    self._routes_cache[cache_key] = result
                    cache_set(shared_key, result, self.routes_cache_ttl)
                    logger.info('Cached destinations for %s', origin_u)
                    return self._strip_test_route_cities(result)
                except ValueError:
                    # If not JSON, might be XML or HTML
                    result = {
                        'success': True,
                        'data': response.text,
                        'status_code': response.status_code,
                        'content_type': response.headers.get('Content-Type', '')
                    }
                    self._routes_cache[cache_key] = result
                    cache_set(shared_key, result, self.routes_cache_ttl)
                    logger.info('Cached destinations for %s (text)', origin_u)
                    return self._strip_test_route_cities(result)
            else:
                return {
                    'success': False,
                    'error': f'API returned status code {response.status_code}',
                    'status_code': response.status_code,
                    'response': response.text[:500]
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
            logger.error(f"Error calling Nira Routes API (destinations): {e}")
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}'
            }

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
            response = requests.get(url, timeout=self.timeout)
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

