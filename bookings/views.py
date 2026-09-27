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
from django.conf import settings
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
        Soft-hold + payment intent.

        Flow (based on Nira APIs available today = Availability only):
        1) idempotency_key → return existing hold if replay
        2) live revalidate Availability (no cache) + AllowReservation
        3) create Booking as HELD with TTL (not CONFIRMED)
        4) create Payment PENDING
        5) if Nira payment redirect configured → return that URL; else local gateways

        Real Nira Reserve/PNR is attempted via client.create_reservation();
        until airline docs exist it returns unsupported and we use soft-hold.
        """
        from .utils import generate_booking_reference
        from .constants import BOOKING_HELD
        from .inventory import (
            build_inventory_key,
            count_locked_seats,
            extract_flight_identity,
            hold_minutes,
            revalidate_with_nira,
        )
        from payments.models import Payment
        from flights.nira_client import NiraClient

        flight_data = request.data.get('flight_data')
        passengers_data = request.data.get('passengers', [])
        contact_info = request.data.get('contact_info', {})
        total_amount = request.data.get('total_amount', 0)
        cabin_class = request.data.get('cabin_class', 'ECONOMY')
        idempotency_key = (request.data.get('idempotency_key') or '').strip() or None

        if not isinstance(flight_data, dict):
            return Response({'error': 'flight_data is required', 'code': 'missing_flight'}, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(passengers_data, list) or len(passengers_data) == 0:
            return Response({'error': 'At least one passenger is required', 'code': 'missing_passengers'}, status=status.HTTP_400_BAD_REQUEST)

        if idempotency_key:
            existing = Booking.objects.filter(user=request.user, idempotency_key=idempotency_key).first()
            if existing:
                payment = Payment.objects.filter(booking=existing).order_by('-created_at').first()
                return Response({
                    'success': True,
                    'replay': True,
                    'booking': {
                        'id': existing.id,
                        'uuid': str(existing.uuid),
                        'booking_reference': existing.booking_reference,
                        'status': existing.status,
                        'hold_expires_at': existing.hold_expires_at.isoformat() if existing.hold_expires_at else None,
                    },
                    'payment': {
                        'id': payment.id if payment else None,
                        'uuid': str(payment.uuid) if payment else None,
                        'transaction_id': payment.transaction_id if payment else None,
                        'status': payment.status if payment else None,
                    },
                    'payment_mode': (existing.metadata or {}).get('payment_mode', 'local'),
                    'payment_url': (existing.metadata or {}).get('payment_url'),
                }, status=status.HTTP_200_OK)

        adults = sum(1 for p in passengers_data if str(p.get('type', 'adult')).lower() == 'adult')
        children = sum(1 for p in passengers_data if str(p.get('type', '')).lower() == 'child')
        infants = sum(1 for p in passengers_data if str(p.get('type', '')).lower() == 'infant')
        if adults < 1:
            adults = 1

        ok, details = revalidate_with_nira(flight_data, adults, children, infants)
        if not ok:
            return Response({
                'success': False,
                'code': details.get('error', 'unavailable'),
                'error': details.get('message', 'پرواز در دسترس نیست.'),
            }, status=status.HTTP_409_CONFLICT)

        identity = details['identity']
        seats_needed = details['seats_needed']
        inventory_key = build_inventory_key(
            identity['flight_number'],
            identity['origin'],
            identity['destination'],
            identity['departure_iso'],
            cabin_class or identity['cabin_class'],
        )

        passenger_type_map = {'adult': 'ADULT', 'child': 'CHILD', 'infant': 'INFANT'}
        nira_client = NiraClient()
        nira_reserve = nira_client.create_reservation({
            'flight': details.get('nira_flight'),
            'passengers': passengers_data,
            'contact': contact_info,
        })

        try:
            with transaction.atomic():
                shadow_flight = self._resolve_or_create_shadow_flight(flight_data, total_amount)
                # Lock shadow flight row to serialize concurrent holds on same local inventory
                from flights.models import Flight
                Flight.objects.select_for_update().filter(pk=shadow_flight.pk).first()

                locked = count_locked_seats(inventory_key)
                # Soft cap: if Nira Status was numeric we could use it; otherwise block absurd pile-up
                soft_cap = int(getattr(settings, 'BOOKING_SOFT_HOLD_CAP', 9))
                if locked + seats_needed > soft_cap:
                    return Response({
                        'success': False,
                        'code': 'local_hold_full',
                        'error': 'ظرفیت موقت این پرواز در حال حاضر تکمیل است. لطفاً لحظاتی بعد دوباره تلاش کنید.',
                    }, status=status.HTTP_409_CONFLICT)

                hold_until = timezone.now() + timedelta(minutes=hold_minutes())
                meta = {
                    'contact_phone': contact_info.get('phone', ''),
                    'contact_email': contact_info.get('email', ''),
                    'flight_data': flight_data,
                    'created_from': 'booking_details_pay_click',
                    'inventory_key': inventory_key,
                    'nira_revalidated': True,
                    'nira_reserve': {
                        'supported': nira_reserve.get('supported'),
                        'code': nira_reserve.get('code'),
                        'ref': nira_reserve.get('pnr') or nira_reserve.get('reservation_ref'),
                    },
                    'payment_mode': 'local',
                }

                booking = Booking.objects.create(
                    user=request.user,
                    flight=shadow_flight,
                    booking_reference=generate_booking_reference(),
                    status=BOOKING_HELD,
                    booking_type='ONE_WAY',
                    cabin_class=(cabin_class or 'ECONOMY').upper(),
                    base_price=Decimal(str(total_amount or 0)),
                    extras_price=Decimal('0'),
                    taxes=Decimal('0'),
                    total_amount=Decimal(str(total_amount or 0)),
                    booking_source='WEB',
                    hold_expires_at=hold_until,
                    idempotency_key=idempotency_key,
                    metadata=meta,
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

                payment_mode = 'local'
                payment_url = None
                # Airline pattern: soft-hold → Nira-hosted payment UI → callback + return
                callback_url = request.build_absolute_uri('/api/payments/nira/callback/')
                return_url = request.build_absolute_uri(
                    f'/payment/verify?ref={booking.booking_reference}&provider=nira'
                )
                nira_pay = nira_client.get_payment_redirect(
                    reservation_ref=booking.booking_reference,
                    callback_url=callback_url,
                    return_url=return_url,
                )
                if nira_pay.get('success') and nira_pay.get('payment_url'):
                    payment_mode = 'nira_redirect'
                    payment_url = nira_pay['payment_url']
                    payment.gateway = 'NIRA'
                    payment.save(update_fields=['gateway'])
                    meta['payment_mode'] = payment_mode
                    meta['payment_url'] = payment_url
                    meta['nira_payment_ref'] = booking.booking_reference
                    meta['nira_callback_url'] = callback_url
                    meta['nira_return_url'] = return_url
                    booking.metadata = meta
                    booking.save(update_fields=['metadata', 'updated_at'])

            return Response({
                'success': True,
                'booking': {
                    'id': booking.id,
                    'uuid': str(booking.uuid),
                    'booking_reference': booking.booking_reference,
                    'status': booking.status,
                    'hold_expires_at': hold_until.isoformat(),
                },
                'payment': {
                    'id': payment.id,
                    'uuid': str(payment.uuid),
                    'transaction_id': payment.transaction_id,
                    'status': payment.status,
                },
                'payment_mode': payment_mode,
                'payment_url': payment_url,
                'nira_reserve_supported': bool(nira_reserve.get('supported')),
                'message': 'رزرو موقت ایجاد شد. لطفاً قبل از انقضا پرداخت را تکمیل کنید.',
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e),
                'code': 'hold_failed',
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
