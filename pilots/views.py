"""
Views for pilots app
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from .models import Pilot, PilotRequest
from .serializers import (
    PilotSerializer,
    PilotDetailSerializer,
    PilotRequestSerializer,
    PilotRequestDetailSerializer
)


class PilotViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Pilot model with full CRUD operations
    """
    queryset = Pilot.objects.select_related('user').all()
    serializer_class = PilotSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'license_type']
    search_fields = [
        'license_number', 'user__email',
        'user__first_name', 'user__last_name'
    ]
    ordering_fields = [
        'user__last_name', 'user__first_name',
        'total_flight_hours', 'created_at'
    ]
    ordering = ['user__last_name', 'user__first_name']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return PilotDetailSerializer
        return PilotSerializer


class PilotRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for PilotRequest model with full CRUD operations
    """
    queryset = PilotRequest.objects.select_related(
        'pilot', 'pilot__user', 'flight', 'responded_by'
    ).all()
    serializer_class = PilotRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'request_type', 'status', 'pilot', 'flight'
    ]
    search_fields = [
        'title', 'description', 'pilot__user__email',
        'pilot__user__first_name', 'pilot__user__last_name',
        'flight__flight_number'
    ]
    ordering_fields = ['created_at', 'updated_at', 'requested_date', 'responded_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return PilotRequestDetailSerializer
        return PilotRequestSerializer
    
    def get_queryset(self):
        """Filter requests by pilot ownership unless admin"""
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            # Check if user is a pilot
            try:
                pilot = Pilot.objects.get(user=self.request.user)
                queryset = queryset.filter(pilot=pilot)
            except Pilot.DoesNotExist:
                queryset = queryset.none()
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        """Approve a pilot request (staff only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff can approve requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        pilot_request = self.get_object()
        response_text = request.data.get('response', 'Approved')
        
        pilot_request.status = 'APPROVED'
        pilot_request.response = response_text
        pilot_request.responded_by = request.user
        pilot_request.responded_at = timezone.now()
        pilot_request.save()
        
        serializer = PilotRequestDetailSerializer(pilot_request)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request, pk=None):
        """Reject a pilot request (staff only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff can reject requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        pilot_request = self.get_object()
        response_text = request.data.get('response', 'Rejected')
        
        pilot_request.status = 'REJECTED'
        pilot_request.response = response_text
        pilot_request.responded_by = request.user
        pilot_request.responded_at = timezone.now()
        pilot_request.save()
        
        serializer = PilotRequestDetailSerializer(pilot_request)
        return Response(serializer.data)
