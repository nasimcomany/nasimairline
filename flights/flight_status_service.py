"""
Flight Status Service
سرویس برای دریافت اطلاعات لحظه‌ای پروازها از API های خارجی

این سرویس آماده است و فقط نیاز به API Key دارد.
وقتی API Key ها آماده شدند، فقط باید در settings.py تنظیم شوند.
"""
import os
import requests
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from django.conf import settings
from django.utils import timezone


class FlightStatusService:
    """
    سرویس برای دریافت اطلاعات لحظه‌ای پروازها
    از API های مختلف مثل سازمان هواپیمایی کشوری، فرودگاه‌ها، یا سرویس‌های بین‌المللی
    """
    
    def __init__(self):
        # تنظیمات API از settings.py
        self.cao_api_url = getattr(settings, 'CAO_API_URL', '')
        self.cao_api_key = getattr(settings, 'CAO_API_KEY', '')
        
        self.airport_api_url = getattr(settings, 'AIRPORT_API_URL', '')
        self.airport_api_key = getattr(settings, 'AIRPORT_API_KEY', '')
        
        # برای پروازهای بین‌المللی (اختیاری)
        self.flightaware_api_key = getattr(settings, 'FLIGHTAWARE_API_KEY', '')
        self.aviationstack_api_key = getattr(settings, 'AVIATIONSTACK_API_KEY', '')
        
        # Timeout برای درخواست‌ها (ثانیه)
        self.timeout = 10
    
    def get_flight_status(
        self,
        flight_number: str,
        origin: str,
        destination: str,
        scheduled_departure: datetime
    ) -> Optional[Dict[str, Any]]:
        """
        دریافت اطلاعات لحظه‌ای پرواز
        
        Args:
            flight_number: شماره پرواز (مثلاً IR123)
            origin: کد فرودگاه مبدا (مثلاً THR)
            destination: کد فرودگاه مقصد (مثلاً MHD)
            scheduled_departure: زمان برنامه‌ریزی شده پرواز
        
        Returns:
            دیکشنری شامل:
            - actual_departure_time: زمان واقعی پرواز
            - actual_arrival_time: زمان واقعی فرود
            - delay_minutes: تأخیر به دقیقه
            - gate: گیت پرواز
            - arrival_gate: گیت فرود
            - stops: تعداد توقف
            - status: وضعیت پرواز (On Time, Delayed, Cancelled, etc.)
        
        اگر API Key تنظیم نشده باشد، None برمی‌گرداند.
        """
        # اگر API Key تنظیم نشده باشد، None برمی‌گردانیم
        if not self._has_api_keys():
            return None
        
        # اول سعی می‌کنیم از سازمان هواپیمایی کشوری بگیریم
        if self.cao_api_url and self.cao_api_key:
            result = self._get_from_cao(flight_number, origin, destination, scheduled_departure)
            if result:
                return result
        
        # اگر نشد، از فرودگاه می‌گیریم
        if self.airport_api_url and self.airport_api_key:
            result = self._get_from_airport(flight_number, origin, destination, scheduled_departure)
            if result:
                return result
        
        # اگر پرواز بین‌المللی است، از سرویس‌های بین‌المللی استفاده می‌کنیم
        if self.flightaware_api_key or self.aviationstack_api_key:
            result = self._get_from_international(flight_number, origin, destination, scheduled_departure)
            if result:
                return result
        
        return None
    
    def _has_api_keys(self) -> bool:
        """بررسی می‌کند که آیا حداقل یک API Key تنظیم شده است"""
        return bool(
            (self.cao_api_url and self.cao_api_key) or
            (self.airport_api_url and self.airport_api_key) or
            self.flightaware_api_key or
            self.aviationstack_api_key
        )
    
    def _get_from_cao(
        self,
        flight_number: str,
        origin: str,
        destination: str,
        scheduled_departure: datetime
    ) -> Optional[Dict[str, Any]]:
        """
        دریافت اطلاعات از سازمان هواپیمایی کشوری
        
        توجه: این تابع آماده است اما نیاز به مستندات API دارد.
        وقتی API Key و مستندات آماده شد، باید بر اساس مستندات تنظیم شود.
        """
        try:
            # این URL و پارامترها باید بر اساس مستندات API تنظیم شود
            url = f"{self.cao_api_url}/flight-status"
            headers = {
                'Authorization': f'Bearer {self.cao_api_key}',
                'Content-Type': 'application/json',
            }
            params = {
                'flight_number': flight_number,
                'origin': origin,
                'destination': destination,
                'date': scheduled_departure.strftime('%Y-%m-%d'),
            }
            
            response = requests.get(url, headers=headers, params=params, timeout=self.timeout)
            response.raise_for_status()
            
            data = response.json()
            
            # این ساختار باید بر اساس پاسخ واقعی API تنظیم شود
            return {
                'actual_departure_time': self._parse_datetime(data.get('actual_departure')),
                'actual_arrival_time': self._parse_datetime(data.get('actual_arrival')),
                'delay_minutes': data.get('delay_minutes'),
                'gate': data.get('gate'),
                'arrival_gate': data.get('arrival_gate'),
                'stops': data.get('stops', 0),
                'status': data.get('status', 'Scheduled'),
            }
        except Exception as e:
            # در حالت development، خطا را لاگ می‌کنیم اما crash نمی‌کنیم
            print(f"Error fetching from CAO API: {e}")
            return None
    
    def _get_from_airport(
        self,
        flight_number: str,
        origin: str,
        destination: str,
        scheduled_departure: datetime
    ) -> Optional[Dict[str, Any]]:
        """
        دریافت اطلاعات از فرودگاه (مثلاً امام خمینی یا مهرآباد)
        
        توجه: این تابع آماده است اما نیاز به مستندات API دارد.
        """
        try:
            url = f"{self.airport_api_url}/flights/{flight_number}"
            headers = {
                'Authorization': f'Bearer {self.airport_api_key}',
                'Content-Type': 'application/json',
            }
            params = {
                'date': scheduled_departure.strftime('%Y-%m-%d'),
            }
            
            response = requests.get(url, headers=headers, params=params, timeout=self.timeout)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                'actual_departure_time': self._parse_datetime(data.get('actual_departure')),
                'actual_arrival_time': self._parse_datetime(data.get('actual_arrival')),
                'delay_minutes': data.get('delay_minutes'),
                'gate': data.get('departure_gate'),
                'arrival_gate': data.get('arrival_gate'),
                'stops': data.get('stops', 0),
                'status': data.get('status', 'Scheduled'),
            }
        except Exception as e:
            print(f"Error fetching from Airport API: {e}")
            return None
    
    def _get_from_international(
        self,
        flight_number: str,
        origin: str,
        destination: str,
        scheduled_departure: datetime
    ) -> Optional[Dict[str, Any]]:
        """
        دریافت اطلاعات از سرویس‌های بین‌المللی (FlightAware یا AviationStack)
        
        این برای پروازهای بین‌المللی استفاده می‌شود.
        """
        # اول FlightAware را امتحان می‌کنیم
        if self.flightaware_api_key:
            result = self._get_from_flightaware(flight_number, origin, destination, scheduled_departure)
            if result:
                return result
        
        # اگر نشد، AviationStack را امتحان می‌کنیم
        if self.aviationstack_api_key:
            result = self._get_from_aviationstack(flight_number, origin, destination, scheduled_departure)
            if result:
                return result
        
        return None
    
    def _get_from_flightaware(
        self,
        flight_number: str,
        origin: str,
        destination: str,
        scheduled_departure: datetime
    ) -> Optional[Dict[str, Any]]:
        """دریافت اطلاعات از FlightAware API"""
        try:
            url = f"https://flightxml.flightaware.com/json/FlightXML3/FlightInfoStatus"
            params = {
                'ident': flight_number,
                'include_ex_data': 'true',
            }
            auth = (self.flightaware_api_key, '')  # FlightAware از Basic Auth استفاده می‌کند
            
            response = requests.get(url, params=params, auth=auth, timeout=self.timeout)
            response.raise_for_status()
            
            data = response.json()
            flight_data = data.get('FlightInfoStatusResult', {}).get('flights', [{}])[0]
            
            return {
                'actual_departure_time': self._parse_datetime(flight_data.get('actualdeparturetime')),
                'actual_arrival_time': self._parse_datetime(flight_data.get('actualarrivaltime')),
                'delay_minutes': self._calculate_delay(
                    scheduled_departure,
                    self._parse_datetime(flight_data.get('actualdeparturetime'))
                ),
                'gate': flight_data.get('gate'),
                'arrival_gate': flight_data.get('arrival_gate'),
                'stops': len(flight_data.get('route', [])) - 2 if flight_data.get('route') else 0,
                'status': flight_data.get('status', 'Scheduled'),
            }
        except Exception as e:
            print(f"Error fetching from FlightAware API: {e}")
            return None
    
    def _get_from_aviationstack(
        self,
        flight_number: str,
        origin: str,
        destination: str,
        scheduled_departure: datetime
    ) -> Optional[Dict[str, Any]]:
        """دریافت اطلاعات از AviationStack API"""
        try:
            url = "http://api.aviationstack.com/v1/flights"
            params = {
                'access_key': self.aviationstack_api_key,
                'flight_iata': flight_number,
                'dep_iata': origin,
                'arr_iata': destination,
                'flight_date': scheduled_departure.strftime('%Y-%m-%d'),
            }
            
            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            
            data = response.json()
            flight_data = data.get('data', [{}])[0]
            
            return {
                'actual_departure_time': self._parse_datetime(flight_data.get('departure', {}).get('actual')),
                'actual_arrival_time': self._parse_datetime(flight_data.get('arrival', {}).get('actual')),
                'delay_minutes': flight_data.get('departure', {}).get('delay') or 0,
                'gate': flight_data.get('departure', {}).get('gate'),
                'arrival_gate': flight_data.get('arrival', {}).get('gate'),
                'stops': len(flight_data.get('route', [])) - 2 if flight_data.get('route') else 0,
                'status': flight_data.get('flight_status', 'Scheduled'),
            }
        except Exception as e:
            print(f"Error fetching from AviationStack API: {e}")
            return None
    
    def _parse_datetime(self, value: Any) -> Optional[datetime]:
        """تبدیل مقدار به datetime"""
        if not value:
            return None
        
        if isinstance(value, datetime):
            return value
        
        if isinstance(value, str):
            # فرمت‌های مختلف datetime را امتحان می‌کنیم
            formats = [
                '%Y-%m-%d %H:%M:%S',
                '%Y-%m-%dT%H:%M:%S',
                '%Y-%m-%dT%H:%M:%SZ',
                '%Y-%m-%d %H:%M:%S.%f',
            ]
            for fmt in formats:
                try:
                    return datetime.strptime(value, fmt)
                except ValueError:
                    continue
        
        return None
    
    def _calculate_delay(
        self,
        scheduled: datetime,
        actual: Optional[datetime]
    ) -> Optional[int]:
        """محاسبه تأخیر به دقیقه"""
        if not actual:
            return None
        
        delay = actual - scheduled
        return int(delay.total_seconds() / 60)
    
    def calculate_stops_from_duration(
        self,
        duration: str,
        origin: str,
        destination: str
    ) -> int:
        """
        محاسبه تعداد توقف از مدت پرواز
        
        این یک تخمین است و بر اساس مدت پرواز و مسیر پرواز محاسبه می‌شود.
        """
        # تبدیل duration به دقیقه
        try:
            parts = duration.split(':')
            hours = int(parts[0])
            minutes = int(parts[1]) if len(parts) > 1 else 0
            total_minutes = hours * 60 + minutes
        except:
            return 0
        
        # مسیرهای مستقیم معمولاً کمتر از 4 ساعت هستند
        # مسیرهای با یک توقف معمولاً بین 4 تا 8 ساعت هستند
        # مسیرهای با دو توقف معمولاً بیشتر از 8 ساعت هستند
        
        # این یک تخمین ساده است و باید بر اساس داده‌های واقعی تنظیم شود
        if total_minutes < 240:  # کمتر از 4 ساعت = مستقیم
            return 0
        elif total_minutes < 480:  # بین 4 تا 8 ساعت = یک توقف
            return 1
        else:  # بیشتر از 8 ساعت = دو توقف یا بیشتر
            return 2

