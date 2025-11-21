"""
Views for main app
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Project, Ticket
from .serializers import (
    ProjectSerializer,
    ProjectDetailSerializer,
    TicketSerializer,
    TicketDetailSerializer
)


class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Project model with full CRUD operations
    """
    queryset = Project.objects.select_related(
        'project_assigned_to', 'project_deleted_by'
    ).prefetch_related('ticket_set').all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'project_status', 'project_type', 'project_priority',
        'project_assigned_to', 'project_completed', 'project_deleted'
    ]
    search_fields = [
        'project_id', 'project_name', 'project_description',
        'project_assigned_to__email', 'project_assigned_to__first_name',
        'project_assigned_to__last_name'
    ]
    ordering_fields = [
        'project_created_at', 'project_updated_at',
        'project_start_date', 'project_end_date', 'project_budget'
    ]
    ordering = ['-project_created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectSerializer


class TicketViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Ticket model with full CRUD operations
    """
    queryset = Ticket.objects.select_related(
        'assigned_to', 'project'
    ).all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'status', 'priority', 'assigned_to', 'project',
        'ticket_type', 'ticket_status', 'ticket_category',
        'ticket_subcategory', 'ticket_severity', 'ticket_source'
    ]
    search_fields = [
        'ticket_id', 'title', 'description',
        'assigned_to__email', 'assigned_to__first_name',
        'assigned_to__last_name', 'project__project_name'
    ]
    ordering_fields = ['created_at', 'updated_at', 'priority']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return TicketDetailSerializer
        return TicketSerializer
