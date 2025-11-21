"""
Views for security app
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from .models import SecurityInfo, SecurityAlert
from .serializers import (
    SecurityInfoSerializer,
    SecurityInfoDetailSerializer,
    SecurityAlertSerializer,
    SecurityAlertDetailSerializer
)


class SecurityInfoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for SecurityInfo model with full CRUD operations
    """
    queryset = SecurityInfo.objects.select_related('flight').all()
    serializer_class = SecurityInfoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'security_level', 'passenger_screening',
        'baggage_screening', 'flight'
    ]
    search_fields = [
        'flight__flight_number', 'special_instructions', 'notes'
    ]
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return SecurityInfoDetailSerializer
        return SecurityInfoSerializer


class SecurityAlertViewSet(viewsets.ModelViewSet):
    """
    ViewSet for SecurityAlert model with full CRUD operations
    """
    queryset = SecurityAlert.objects.select_related(
        'flight', 'resolved_by'
    ).all()
    serializer_class = SecurityAlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'threat_type', 'security_level', 'status', 'flight'
    ]
    search_fields = [
        'title', 'description', 'flight__flight_number',
        'resolution_notes'
    ]
    ordering_fields = [
        'created_at', 'updated_at', 'resolved_at'
    ]
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return SecurityAlertDetailSerializer
        return SecurityAlertSerializer
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def resolve(self, request, pk=None):
        """Resolve a security alert (staff only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff can resolve alerts'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        security_alert = self.get_object()
        resolution_notes = request.data.get('resolution_notes', '')
        
        security_alert.status = 'RESOLVED'
        security_alert.resolved_by = request.user
        security_alert.resolved_at = timezone.now()
        security_alert.resolution_notes = resolution_notes
        security_alert.save()
        
        serializer = SecurityAlertDetailSerializer(security_alert)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def activate(self, request, pk=None):
        """Activate a security alert (staff only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff can activate alerts'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        security_alert = self.get_object()
        security_alert.status = 'ACTIVE'
        security_alert.resolved_by = None
        security_alert.resolved_at = None
        security_alert.resolution_notes = ''
        security_alert.save()
        
        serializer = SecurityAlertDetailSerializer(security_alert)
        return Response(serializer.data)
