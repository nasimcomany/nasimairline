"""
Custom managers for flights app
"""
from django.db import models
from django.utils import timezone
from datetime import datetime, timedelta
from .constants import (
    FLIGHT_SCHEDULED,
    FLIGHT_COMPLETED,
    FLIGHT_CANCELLED,
)


class AirportManager(models.Manager):
    """
    Custom manager for Airport model
    """
    
    def active(self):
        """Return only active airports"""
        return self.filter(is_active=True)
    
    def by_country(self, country):
        """Filter airports by country"""
        return self.filter(country=country)
    
    def by_city(self, city):
        """Filter airports by city"""
        return self.filter(city=city)
    
    def popular(self, limit=10):
        """Return most popular airports"""
        return self.active().order_by('-flight_count')[:limit]


class FlightManager(models.Manager):
    """
    Custom manager for Flight model
    """
    
    def scheduled(self):
        """Return scheduled flights"""
        return self.filter(status=FLIGHT_SCHEDULED)
    
    def upcoming(self, days=30):
        """Return upcoming flights within specified days"""
        now = timezone.now()
        future_date = now + timedelta(days=days)
        return self.filter(
            departure_time__gte=now,
            departure_time__lte=future_date,
            status=FLIGHT_SCHEDULED
        )
    
    def available(self):
        """Return flights with available seats"""
        return self.filter(
            economy_available__gt=0
        ) | self.filter(
            business_available__gt=0
        ) | self.filter(
            first_class_available__gt=0
        )
    
    def by_route(self, origin, destination):
        """Filter flights by route"""
        return self.filter(origin=origin, destination=destination)
    
    def by_date_range(self, start_date, end_date):
        """Filter flights by date range"""
        return self.filter(
            departure_time__gte=start_date,
            departure_time__lte=end_date
        )
    
    def by_price_range(self, min_price, max_price, cabin_class='ECONOMY'):
        """Filter flights by price range for specific cabin class"""
        price_field = f'{cabin_class.lower()}_price'
        return self.filter(**{
            f'{price_field}__gte': min_price,
            f'{price_field}__lte': max_price,
        })
    
    def completed(self):
        """Return completed flights"""
        return self.filter(status=FLIGHT_COMPLETED)
    
    def cancelled(self):
        """Return cancelled flights"""
        return self.filter(status=FLIGHT_CANCELLED)
    
    def delayed(self):
        """Return delayed flights"""
        return self.filter(status='DELAYED')
    
    def with_available_seats(self, cabin_class='ECONOMY', min_seats=1):
        """Filter flights with minimum available seats"""
        availability_field = f'{cabin_class.lower()}_available'
        return self.filter(**{f'{availability_field}__gte': min_seats})


class AircraftManager(models.Manager):
    """
    Custom manager for Aircraft model
    """
    
    def active(self):
        """Return only active aircrafts"""
        return self.filter(is_active=True)
    
    def by_model(self, model):
        """Filter aircrafts by model"""
        return self.filter(model=model)
    
    def by_manufacturer(self, manufacturer):
        """Filter aircrafts by manufacturer"""
        return self.filter(manufacturer=manufacturer)
    
    def large_capacity(self, min_seats=200):
        """Return aircrafts with large capacity"""
        return self.filter(total_seats__gte=min_seats)

