"""
Views for bookings app
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
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
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def create_after_payment(self, request):
        """
        Create booking and payment after successful payment verification
        این endpoint برای ساخت Booking و Payment بعد از موفقیت پرداخت هست
        """
        from payments.models import Payment
        from django.utils import timezone
        from .utils import generate_booking_reference
        
        # داده‌های دریافتی
        flight_data = request.data.get('flight_data')
        passengers_data = request.data.get('passengers', [])
        contact_info = request.data.get('contact_info', {})
        total_amount = request.data.get('total_amount', 0)
        cabin_class = request.data.get('cabin_class', 'ECONOMY')
        payment_ref_id = request.data.get('payment_ref_id')
        
        # بررسی کاربر
        user = request.user if request.user.is_authenticated else None
        
        try:
            # پیدا کردن flight بر اساس flight_data یا ساخت یک flight dummy
            from flights.models import Flight, Aircraft
            
            flight_number = flight_data.get('flightNumber', 'UNKNOWN') if flight_data else 'UNKNOWN'
            
            # سعی کن flight رو پیدا کنی
            try:
                temp_flight = Flight.objects.filter(flight_number=flight_number).first()
                
                if not temp_flight:
                    # اگه پیدا نشد، اولین flight رو بگیر
                    temp_flight = Flight.objects.first()
                    
                    if not temp_flight:
                        # اگه هیچ flight ای نبود، یک flight dummy بساز
                        # اول یک aircraft لازمه
                        aircraft = Aircraft.objects.first()
                        if not aircraft:
                            # اگه aircraft هم نبود، یکی بساز
                            aircraft = Aircraft.objects.create(
                                registration_number='TEMP-001',
                                model='Boeing 737',
                                manufacturer='Boeing',
                                total_seats=180,
                                economy_seats=150,
                                business_seats=20,
                                first_class_seats=10
                            )
                        
                        temp_flight = Flight.objects.create(
                            flight_number='TEMP-001',
                            aircraft=aircraft,
                            origin='THR',
                            destination='MHD',
                            departure_time='2024-01-01 10:00:00',
                            arrival_time='2024-01-01 12:00:00',
                            status='SCHEDULED'
                        )
            except Exception as e:
                return Response({
                    'success': False,
                    'error': f'Flight error: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 1. ساخت Booking
            booking = Booking.objects.create(
                user=user,
                flight=temp_flight,
                booking_reference=generate_booking_reference(),
                status='CONFIRMED',  # از اول confirmed چون پرداخت شده
                booking_type='ONE_WAY',
                cabin_class=cabin_class.upper(),
                total_amount=total_amount,
                booking_source='WEB',
                metadata={
                    'contact_phone': contact_info.get('phone', ''),
                    'contact_email': contact_info.get('email', ''),
                    'flight_data': flight_data
                }
            )
            
            # 2. ساخت Passengers
            for passenger_data in passengers_data:
                Passenger.objects.create(
                    booking=booking,
                    passenger_type=passenger_data.get('type', 'ADULT').upper(),
                    first_name=passenger_data.get('firstName', ''),
                    last_name=passenger_data.get('lastName', ''),
                    gender=passenger_data.get('gender', 'male').upper()[0],  # M or F
                    national_id=passenger_data.get('nationalId', ''),
                    passport_number=passenger_data.get('passportNumber', ''),
                    date_of_birth=passenger_data.get('birthDate'),
                    nationality='IRANIAN' if not passenger_data.get('isForeign') else 'FOREIGN'
                )
            
            # 3. ساخت Payment
            payment = Payment.objects.create(
                user=user,
                booking=booking,
                amount=total_amount,
                method='ONLINE',
                gateway='ZARINPAL',
                status='COMPLETED',
                gateway_transaction_id=payment_ref_id,
                completed_at=timezone.now()
            )
            
            # 4. بازگشت پاسخ
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
