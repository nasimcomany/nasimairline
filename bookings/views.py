"""
Views for bookings app
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from django.db import transaction
from datetime import timedelta, date
from decimal import Decimal
from .models import Booking, Passenger, BookingExtra
from .serializers import (
    BookingSerializer,
    BookingDetailSerializer,
    BookingCreateSerializer,
    PassengerSerializer,
    BookingExtraSerializer
)


class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Booking model with full CRUD operations
    """
    queryset = Booking.objects.select_related('user', 'flight').prefetch_related(
        'passengers', 'extras'
    ).all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'status', 'booking_type', 'cabin_class',
        'booking_source', 'flight', 'user', 'uuid', 'booking_ip'
    ]
    search_fields = [
        'uuid', 'booking_reference', 'user__email',
        'flight__flight_number', 'booking_ip'
    ]
    ordering_fields = ['uuid', 'created_at', 'updated_at', 'total_amount']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return BookingDetailSerializer
        elif self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer
    
    def get_queryset(self):
        """Filter bookings by current user unless admin"""
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        return queryset
    
    def perform_create(self, serializer):
        """Set user to current user when creating booking"""
        serializer.save(user=self.request.user)

    def _normalize_airport_code(self, raw_value, fallback):
        """Extract 3-letter IATA code from mixed inputs."""
        if not raw_value:
            return fallback
        letters = ''.join(ch for ch in str(raw_value).upper() if ch.isalpha())
        if len(letters) >= 3:
            return letters[:3]
        return fallback

    def _sanitize_flight_number(self, raw_value):
        """Generate a validator-safe flight number (3-6 chars)."""
        cleaned = ''.join(ch for ch in str(raw_value or '').upper() if ch.isalnum())
        if len(cleaned) < 3:
            cleaned = f"NS{timezone.now().strftime('%f')[-4:]}"
        if len(cleaned) > 6:
            cleaned = cleaned[-6:]
        return cleaned

    def _resolve_or_create_shadow_flight(self, flight_data, total_amount):
        """
        Create/find a lightweight DB flight to link booking rows created
        from Nira response data.
        """
        from flights.models import Flight, Aircraft, Airport

        original_data = (flight_data or {}).get('originalData', {}) if isinstance(flight_data, dict) else {}
        origin_raw = (flight_data or {}).get('originCode') or (flight_data or {}).get('origin_code') or original_data.get('Origin') or (flight_data or {}).get('origin')
        destination_raw = (flight_data or {}).get('destinationCode') or (flight_data or {}).get('destination_code') or original_data.get('Destination') or (flight_data or {}).get('destination')
        flight_no_raw = (flight_data or {}).get('flightNumber') or original_data.get('FlightNo') or 'NS100'

        origin_code = self._normalize_airport_code(origin_raw, 'THR')
        destination_code = self._normalize_airport_code(destination_raw, 'MHD')
        flight_number = self._sanitize_flight_number(flight_no_raw)

        origin_airport, _ = Airport.objects.get_or_create(
            code=origin_code,
            defaults={
                'name': f'{origin_code} Airport',
                'city': origin_code,
                'country': 'Iran',
                'is_active': True,
            },
        )
        destination_airport, _ = Airport.objects.get_or_create(
            code=destination_code,
            defaults={
                'name': f'{destination_code} Airport',
                'city': destination_code,
                'country': 'Iran',
                'is_active': True,
            },
        )

        aircraft, _ = Aircraft.objects.get_or_create(
            registration_number='TMP001',
            defaults={
                'model': 'B737',
                'manufacturer': 'Boeing',
                'total_seats': 180,
                'economy_seats': 150,
                'business_seats': 20,
                'first_class_seats': 10,
                'is_active': True,
            },
        )

        try:
            amount = Decimal(str(total_amount or 0))
        except Exception:
            amount = Decimal('0')

        departure_time = timezone.now() + timedelta(hours=2)
        arrival_time = departure_time + timedelta(hours=2)

        flight = Flight.objects.filter(flight_number=flight_number).first()
        if flight:
            return flight

        return Flight.objects.create(
            flight_number=flight_number,
            origin=origin_airport,
            destination=destination_airport,
            aircraft=aircraft,
            departure_time=departure_time,
            arrival_time=arrival_time,
            economy_price=amount,
            business_price=amount,
            first_class_price=amount,
            economy_available=max(0, aircraft.economy_seats),
            business_available=max(0, aircraft.business_seats),
            first_class_available=max(0, aircraft.first_class_seats),
            status='SCHEDULED',
        )
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        booking = self.get_object()
        
        # Check if user owns the booking or is staff
        if booking.user != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You do not have permission to cancel this booking'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if booking.status == 'CANCELLED':
            return Response(
                {'error': 'Booking is already cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cancellation_reason = request.data.get('cancellation_reason', '')
        booking.status = 'CANCELLED'
        booking.cancellation_reason = cancellation_reason
        booking.save()
        
        serializer = BookingDetailSerializer(booking)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def refund_info(self, request, pk=None):
        """Get refund information for a booking"""
        booking = self.get_object()
        
        return Response({
            'is_refundable': booking.is_refundable(),
            'can_modify': booking.can_modify(),
            'status': booking.status,
            'total_amount': booking.total_amount
        })
    
    @action(
        detail=False,
        methods=['post'],
        permission_classes=[permissions.IsAuthenticated],
        url_path='initiate-payment',
    )
    def initiate_payment(self, request):
        """
        Save booking/payment intent immediately on pay-click.
        This guarantees records are visible in admin right away.
        """
        from .utils import generate_booking_reference
        from payments.models import Payment

        flight_data = request.data.get('flight_data')
        passengers_data = request.data.get('passengers', [])
        contact_info = request.data.get('contact_info', {})
        total_amount = request.data.get('total_amount', 0)
        cabin_class = request.data.get('cabin_class', 'ECONOMY')

        if not isinstance(flight_data, dict):
            return Response({'error': 'flight_data is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(passengers_data, list) or len(passengers_data) == 0:
            return Response({'error': 'At least one passenger is required'}, status=status.HTTP_400_BAD_REQUEST)

        passenger_type_map = {'adult': 'ADULT', 'child': 'CHILD', 'infant': 'INFANT'}

        try:
            with transaction.atomic():
                shadow_flight = self._resolve_or_create_shadow_flight(flight_data, total_amount)

                booking = Booking.objects.create(
                    user=request.user,
                    flight=shadow_flight,
                    booking_reference=generate_booking_reference(),
                    status='CONFIRMED',  # requested: update membership right after pay click
                    booking_type='ONE_WAY',
                    cabin_class=(cabin_class or 'ECONOMY').upper(),
                    base_price=Decimal(str(total_amount or 0)),
                    extras_price=Decimal('0'),
                    taxes=Decimal('0'),
                    total_amount=Decimal(str(total_amount or 0)),
                    booking_source='WEB',
                    metadata={
                        'contact_phone': contact_info.get('phone', ''),
                        'contact_email': contact_info.get('email', ''),
                        'flight_data': flight_data,
                        'created_from': 'booking_details_pay_click',
                    },
                )

                for passenger_data in passengers_data:
                    birth_date_raw = passenger_data.get('birthDate')
                    birth_date = None
                    if birth_date_raw:
                        try:
                            birth_date = date.fromisoformat(str(birth_date_raw))
                        except Exception:
                            birth_date = None
                    Passenger.objects.create(
                        booking=booking,
                        passenger_type=passenger_type_map.get(str(passenger_data.get('type', 'adult')).lower(), 'ADULT'),
                        first_name=passenger_data.get('firstName', '') or '',
                        last_name=passenger_data.get('lastName', '') or '',
                        gender='F' if str(passenger_data.get('gender', 'male')).lower() == 'female' else 'M',
                        national_id=passenger_data.get('nationalId', '') or '',
                        passport_number=passenger_data.get('passportNumber', '') or '',
                        date_of_birth=birth_date or date(1990, 1, 1),
                        nationality='FOREIGN' if passenger_data.get('isForeign') else 'IRANIAN',
                    )

                payment = Payment.objects.create(
                    user=request.user,
                    booking=booking,
                    amount=Decimal(str(total_amount or 0)),
                    method='ONLINE',
                    gateway='ZARINPAL',
                    status='PENDING',
                )

            return Response({
                'success': True,
                'booking': {
                    'id': booking.id,
                    'uuid': str(booking.uuid),
                    'booking_reference': booking.booking_reference,
                    'status': booking.status
                },
                'payment': {
                    'id': payment.id,
                    'uuid': str(payment.uuid),
                    'transaction_id': payment.transaction_id,
                    'status': payment.status
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class PassengerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Passenger model
    """
    queryset = Passenger.objects.select_related('booking').all()
    serializer_class = PassengerSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['passenger_type', 'gender', 'nationality', 'booking']
    search_fields = ['first_name', 'last_name', 'passport_number', 'national_id']
    ordering_fields = ['last_name', 'first_name', 'created_at']
    ordering = ['booking', 'passenger_type', 'last_name']
    
    def get_queryset(self):
        """Filter passengers by booking ownership"""
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(booking__user=self.request.user)
        return queryset


class BookingExtraViewSet(viewsets.ModelViewSet):
    """
    ViewSet for BookingExtra model
    """
    queryset = BookingExtra.objects.select_related('booking').all()
    serializer_class = BookingExtraSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['service_type', 'booking']
    search_fields = ['service_name', 'service_type']
    ordering_fields = ['created_at', 'total_price']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter extras by booking ownership"""
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(booking__user=self.request.user)
        return queryset
