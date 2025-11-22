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
