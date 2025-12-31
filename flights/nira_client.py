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

logger = logging.getLogger(__name__)


class NiraClient:
    """
    Client for Nira API integration
    """
    
    def __init__(self):
        """
        Initialize Nira client with settings
        """
        self.base_url = getattr(settings, 'NIRA_BASE_URL', '')
        self.api_url = f"{self.base_url}/api/Res" if self.base_url else None
        self.ws_url = f"{self.base_url}/ws1/NRSCWS.jsp" if self.base_url else None
        self.office_user = getattr(settings, 'NIRA_OFFICE_USER', '')
        self.office_pass = getattr(settings, 'NIRA_OFFICE_PASS', '')
        self.timeout = getattr(settings, 'NIRA_API_TIMEOUT', 60)  # Default 60 seconds for slow APIs
        
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
    
    def check_availability(
        self,
        origin: str,
        destination: str,
        departure_date: datetime,
        round_trip: bool = False,
        return_date: Optional[datetime] = None,
        adult_qty: int = 1,
        child_qty: int = 0,
        infant_qty: int = 0
    ) -> Dict[str, Any]:
        """
        Check flight availability using Nira IBE API
        
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
        if not self.api_url:
            return {
                'success': False,
                'error': 'Nira API URL is not configured'
            }
        
        if not self.office_user or not self.office_pass:
            return {
                'success': False,
                'error': 'Nira Office credentials are not configured'
            }
        
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
            'isForeign': None,
        }
        
        # Add round trip fields if needed
        if round_trip:
            json_data['roundTrip'] = True
            if return_date_jalali:
                json_data['ReturnDate'] = return_date_jalali
        else:
            json_data['roundTrip'] = False
        
        try:
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
            
            # Check response status
            if response.status_code == 200:
                try:
                    # Try to parse JSON response
                    data = response.json()
                    return {
                        'success': True,
                        'data': data,
                        'status_code': response.status_code
                    }
                except ValueError:
                    # If not JSON, return HTML/text response
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
    
    def get_origin_cities(self) -> Dict[str, Any]:
        """
        Get list of origin cities from Nira Routes API
        
        Note: origin parameter should be empty to get all origin cities
        
        Returns:
            Dictionary containing list of origin cities or error information
        """
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
                    return {
                        'success': True,
                        'data': data,
                        'status_code': response.status_code
                    }
                except ValueError:
                    # If not JSON, might be XML or HTML
                    return {
                        'success': True,
                        'data': response.text,
                        'status_code': response.status_code,
                        'content_type': response.headers.get('Content-Type', '')
                    }
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
            logger.error(f"Error calling Nira Routes API (origin cities): {e}")
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}'
            }
    
    def get_destinations(self, origin: str) -> Dict[str, Any]:
        """
        Get list of flight destinations from a specific origin
        
        Args:
            origin: Origin airport IATA code (e.g., 'THR')
            
        Returns:
            Dictionary containing list of destinations or error information
        """
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
            'Origin': origin.upper(),  # IATA code of origin (capital O)
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
                    return {
                        'success': True,
                        'data': data,
                        'status_code': response.status_code
                    }
                except ValueError:
                    # If not JSON, might be XML or HTML
                    return {
                        'success': True,
                        'data': response.text,
                        'status_code': response.status_code,
                        'content_type': response.headers.get('Content-Type', '')
                    }
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

