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
        self.ibe_url = f"{self.base_url}/ibe" if self.base_url else None
        self.ws_url = f"{self.base_url}/ws1/NRSCWS.jsp" if self.base_url else None
        self.office_user = getattr(settings, 'NIRA_OFFICE_USER', '')
        self.office_pass = getattr(settings, 'NIRA_OFFICE_PASS', '')
        self.timeout = getattr(settings, 'NIRA_API_TIMEOUT', 30)
        
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
        if not self.ibe_url:
            return {
                'success': False,
                'error': 'Nira API URL is not configured'
            }
        
        # Convert dates to Jalali format
        departure_date_jalali = self._convert_to_jalali(departure_date)
        return_date_jalali = None
        if round_trip and return_date:
            return_date_jalali = self._convert_to_jalali(return_date)
        
        # Build query parameters
        params = {
            'origin': origin.upper(),
            'destination': destination.upper(),
            'departureDate': departure_date_jalali,
            'roundTrip': 'true' if round_trip else 'false',
            'adultQty': str(adult_qty),
            'childQty': str(child_qty),
            'infantQty': str(infant_qty),
        }
        
        if round_trip and return_date_jalali:
            params['returnDate'] = return_date_jalali
        
        try:
            # Make request to Nira API
            response = requests.get(
                f"{self.ibe_url}/Availability",
                params=params,
                timeout=self.timeout
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
                return {
                    'success': False,
                    'error': f'API returned status code {response.status_code}',
                    'status_code': response.status_code,
                    'response': response.text[:500]  # First 500 chars
                }
                
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'error': 'Request timeout - Nira API did not respond in time'
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
        
        if not self.office_user or not self.office_pass:
            return {
                'success': False,
                'error': 'Nira Office credentials are not configured'
            }
        
        # Build query parameters
        params = {
            'ModuleType': 'SP',
            'ModuleName': 'RoutesApp',
            'origin': '',  # Empty to get all origin cities
            'OfficeUser': self.office_user,
            'OfficePass': self.office_pass,
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
                'error': 'Request timeout - Nira API did not respond in time'
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
        
        if not self.office_user or not self.office_pass:
            return {
                'success': False,
                'error': 'Nira Office credentials are not configured'
            }
        
        # Build query parameters
        params = {
            'ModuleType': 'SP',
            'ModuleName': 'RoutesApp',
            'origin': origin.upper(),  # IATA code of origin
            'OfficeUser': self.office_user,
            'OfficePass': self.office_pass,
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
                'error': 'Request timeout - Nira API did not respond in time'
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

