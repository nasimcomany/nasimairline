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
