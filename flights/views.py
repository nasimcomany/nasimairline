"""
Views for flights app
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Airport, Aircraft, Flight
from .serializers import (
    AirportSerializer,
    AirportDetailSerializer,
    AircraftSerializer,
    AircraftDetailSerializer,
    FlightSerializer,
    FlightDetailSerializer,
    FlightSearchSerializer
)
from .nira_serializers import (
    NiraAvailabilityRequestSerializer,
    NiraRoutesRequestSerializer
)
from .nira_client import NiraClient
from .flight_status_service import FlightStatusService


class AirportViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Airport model with full CRUD operations
    """
    queryset = Airport.objects.all()
    serializer_class = AirportSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['country', 'city', 'is_active', 'uuid']
    search_fields = ['uuid', 'code', 'name', 'slug', 'city', 'country']
    ordering_fields = ['uuid', 'name', 'city', 'country', 'created_at']
    ordering = ['country', 'city', 'name']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return AirportDetailSerializer
        return AirportSerializer


class AircraftViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Aircraft model with full CRUD operations
    """
    queryset = Aircraft.objects.all()
    serializer_class = AircraftSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['aircraft_type', 'manufacturer', 'is_active', 'uuid']
    search_fields = ['uuid', 'registration_number', 'model', 'manufacturer']
    ordering_fields = ['uuid', 'manufacturer', 'model', 'registration_number', 'created_at']
    ordering = ['manufacturer', 'model', 'registration_number']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return AircraftDetailSerializer
        return AircraftSerializer


class FlightViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Flight model with full CRUD operations
    """
    queryset = Flight.objects.select_related('origin', 'destination', 'aircraft').all()
    serializer_class = FlightSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'status', 'flight_type', 'origin', 'destination',
        'aircraft', 'departure_time', 'uuid'
    ]
    search_fields = [
        'uuid', 'flight_number', 'origin__code', 'origin__name',
        'destination__code', 'destination__name'
    ]
    ordering_fields = ['uuid', 'departure_time', 'arrival_time', 'created_at']
    ordering = ['departure_time']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return FlightDetailSerializer
        return FlightSerializer
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def search(self, request):
        """
        Search for flights based on criteria
        """
        serializer = FlightSearchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        origin_code = serializer.validated_data['origin']
        destination_code = serializer.validated_data['destination']
        departure_date = serializer.validated_data['departure_date']
        passengers = serializer.validated_data.get('passengers', 1)
        cabin_class = serializer.validated_data.get('cabin_class', 'ECONOMY')
        
        # Get airports
        try:
            origin = Airport.objects.get(code=origin_code)
            destination = Airport.objects.get(code=destination_code)
        except Airport.DoesNotExist:
            return Response(
                {'error': 'Invalid airport code'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Build date range
        start_datetime = timezone.make_aware(
            datetime.combine(departure_date, datetime.min.time())
        )
        end_datetime = start_datetime + timedelta(days=1)
        
        # Query flights
        flights = Flight.objects.filter(
            origin=origin,
            destination=destination,
            departure_time__gte=start_datetime,
            departure_time__lt=end_datetime,
            status='SCHEDULED'
        )
        
        # Filter by availability
        if cabin_class == 'ECONOMY':
            flights = flights.filter(economy_available__gte=passengers)
        elif cabin_class == 'BUSINESS':
            flights = flights.filter(business_available__gte=passengers)
        elif cabin_class == 'FIRST_CLASS':
            flights = flights.filter(first_class_available__gte=passengers)
        
        serializer = FlightSerializer(flights, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def availability(self, request, pk=None):
        """
        Check flight availability for specific cabin class and passengers
        """
        flight = self.get_object()
        cabin_class = request.query_params.get('cabin_class', 'ECONOMY')
        passengers = int(request.query_params.get('passengers', 1))
        
        is_available = flight.is_available(cabin_class, passengers)
        available_seats = 0
        
        if cabin_class == 'ECONOMY':
            available_seats = flight.economy_available
        elif cabin_class == 'BUSINESS':
            available_seats = flight.business_available
        elif cabin_class == 'FIRST_CLASS':
            available_seats = flight.first_class_available
        
        return Response({
            'is_available': is_available,
            'available_seats': available_seats,
            'requested_passengers': passengers,
            'cabin_class': cabin_class,
            'price': flight.get_price(cabin_class)
        })
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def realtime_status(self, request, pk=None):
        """
        دریافت اطلاعات لحظه‌ای پرواز (زمان واقعی، تأخیر، گیت، تعداد توقف)
        
        این endpoint از FlightStatusService استفاده می‌کند.
        اگر API Key ها تنظیم نشده باشند، None برمی‌گرداند.
        """
        flight = self.get_object()
        status_service = FlightStatusService()
        
        # دریافت اطلاعات لحظه‌ای
        realtime_data = status_service.get_flight_status(
            flight_number=flight.flight_number,
            origin=flight.origin.code,
            destination=flight.destination.code,
            scheduled_departure=flight.departure_time
        )
        
        # اگر اطلاعات لحظه‌ای دریافت شد، به‌روزرسانی می‌کنیم
        if realtime_data:
            flight.actual_departure_time = realtime_data.get('actual_departure_time')
            flight.actual_arrival_time = realtime_data.get('actual_arrival_time')
            flight.delay_minutes = realtime_data.get('delay_minutes')
            flight.departure_gate = realtime_data.get('gate')
            flight.arrival_gate = realtime_data.get('arrival_gate')
            flight.stops = realtime_data.get('stops', 0)
            flight.save()
        
        # اگر تعداد توقف از Nira API محاسبه نشده باشد، از FlightDurationTime محاسبه می‌کنیم
        if not flight.stops and flight.duration:
            duration_str = str(flight.duration)
            flight.stops = status_service.calculate_stops_from_duration(
                duration=duration_str,
                origin=flight.origin.code,
                destination=flight.destination.code
            )
            flight.save()
        
        # برگرداندن اطلاعات پرواز با serializer
        serializer = FlightDetailSerializer(flight)
        return Response({
            'flight': serializer.data,
            'realtime_available': realtime_data is not None,
            'message': 'Real-time data retrieved successfully' if realtime_data else 'Real-time data not available (API keys not configured)'
        })


class NiraAPIViewSet(viewsets.ViewSet):
    """
    ViewSet for Nira API integration
    Provides endpoints for Availability and Routes APIs
    """
    permission_classes = [permissions.AllowAny]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.nira_client = NiraClient()
    
    @action(detail=False, methods=['post'], url_path='availability')
    def check_availability(self, request):
        """
        Check flight availability using Nira IBE API
        
        POST /api/flights/nira/availability/
        
        Request body:
        {
            "origin": "THR",
            "destination": "MHD",
            "departure_date": "2023-11-04",
            "round_trip": true,
            "return_date": "2023-11-06",
            "adult_qty": 1,
            "child_qty": 0,
            "infant_qty": 0
        }
        """
        serializer = NiraAvailabilityRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        validated_data = serializer.validated_data
        
        # Convert date string to datetime
        departure_date = datetime.combine(
            validated_data['departure_date'],
            datetime.min.time()
        )
        return_date = None
        if validated_data.get('return_date'):
            return_date = datetime.combine(
                validated_data['return_date'],
                datetime.min.time()
            )
        
        # Call Nira API
        result = self.nira_client.check_availability(
            origin=validated_data['origin'],
            destination=validated_data['destination'],
            departure_date=departure_date,
            round_trip=validated_data.get('round_trip', False),
            return_date=return_date,
            adult_qty=validated_data.get('adult_qty', 1),
            child_qty=validated_data.get('child_qty', 0),
            infant_qty=validated_data.get('infant_qty', 0)
        )
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            # Return full error details for debugging
            return Response(
                result,  # Return full result object with all debug info
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'], url_path='routes/origins')
    def get_origin_cities(self, request):
        """
        Get list of origin cities from Nira Routes API
        
        GET /api/flights/nira/routes/origins/
        """
        result = self.nira_client.get_origin_cities()
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            # Return full error details for debugging
            return Response(
                result,  # Return full result object with all debug info
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'], url_path='routes/destinations')
    def get_destinations(self, request):
        """
        Get list of destinations from a specific origin
        
        GET /api/flights/nira/routes/destinations/?origin=THR
        
        Query parameters:
        - origin: Origin airport IATA code (required)
        """
        serializer = NiraRoutesRequestSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        
        origin = serializer.validated_data.get('origin', '')
        
        if not origin:
            return Response(
                {'error': 'Origin parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = self.nira_client.get_destinations(origin=origin)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': result.get('error', 'Unknown error')},
                status=status.HTTP_400_BAD_REQUEST
            )
