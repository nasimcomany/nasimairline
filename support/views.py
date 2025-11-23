"""
Views for support app
"""
from rest_framework import viewsets, status, permissions, serializers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.conf import settings
from .models import Ticket, TicketMessage, TicketAttachment, TicketCategory
from .permissions import IsTicketOwnerOrStaff
from .serializers import (
    TicketSerializer,
    TicketDetailSerializer,
    TicketCreateSerializer,
    TicketUpdateSerializer,
    TicketMessageSerializer,
    TicketAttachmentSerializer,
    TicketCategorySerializer,
)
from .permissions import IsTicketOwnerOrStaff, IsStaffOrReadOnly


class TicketCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for TicketCategory (read-only for customers)
    """
    queryset = TicketCategory.objects.filter(is_active=True)
    serializer_class = TicketCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['order', 'name', 'created_at']
    ordering = ['order', 'name']


class TicketViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Ticket model
    """
    queryset = Ticket.objects.select_related(
        'user', 'assigned_to', 'ticket_category',
        'related_booking', 'related_flight'
    ).prefetch_related('messages', 'attachments').all()
    
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'status', 'priority', 'category', 'source',
        'assigned_to', 'ticket_category'
    ]
    search_fields = [
        'reference', 'title', 'description',
        'user__email', 'user__first_name', 'user__last_name'
    ]
    ordering_fields = ['created_at', 'updated_at', 'priority', 'sla_deadline']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return TicketDetailSerializer
        elif self.action == 'create':
            return TicketCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TicketUpdateSerializer
        return TicketSerializer
    
    def get_queryset(self):
        """Filter queryset based on user permissions"""
        queryset = super().get_queryset()
        
        # Staff can see all tickets
        if self.request.user.is_staff:
            return queryset
        
        # Regular users can only see their own tickets
        return queryset.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Set user and IP when creating ticket"""
        request = self.request
        serializer.save(
            user=request.user,
            ticket_ip=self._get_client_ip(request)
        )
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    @action(detail=True, methods=['post'], permission_classes=[IsTicketOwnerOrStaff])
    def add_message(self, request, pk=None):
        """Add message to ticket"""
        ticket = self.get_object()
        
        serializer = TicketMessageSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        # Set message type based on user
        message_type = 'CUSTOMER' if not request.user.is_staff else 'STAFF'
        serializer.save(
            ticket=ticket,
            user=request.user,
            message_type=message_type
        )
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get all messages for a ticket"""
        ticket = self.get_object()
        
        # Check permission
        if not request.user.is_staff and ticket.user != request.user:
            return Response(
                {'error': 'شما دسترسی به این تیکت ندارید.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        messages = ticket.messages.filter(is_internal=False)
        serializer = TicketMessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def assign(self, request, pk=None):
        """Assign ticket to staff member"""
        ticket = self.get_object()
        assigned_to_id = request.data.get('assigned_to')
        
        if not assigned_to_id:
            return Response(
                {'error': 'شناسه کاربر الزامی است.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from accounts.models import User
        try:
            assigned_to = User.objects.get(pk=assigned_to_id, is_staff=True)
            ticket.assigned_to = assigned_to
            ticket.save()
            return Response({'message': 'تیکت با موفقیت اختصاص داده شد.'})
        except User.DoesNotExist:
            return Response(
                {'error': 'کاربر یافت نشد.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def close(self, request, pk=None):
        """Close ticket"""
        ticket = self.get_object()
        ticket.status = 'CLOSED'
        ticket.closed_at = timezone.now()
        ticket.save()
        return Response({'message': 'تیکت با موفقیت بسته شد.'})
    
    @action(detail=False, methods=['get'])
    def my_tickets(self, request):
        """Get current user's tickets"""
        tickets = self.get_queryset().filter(user=request.user)
        page = self.paginate_queryset(tickets)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(tickets, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def overdue(self, request):
        """Get overdue tickets"""
        tickets = self.get_queryset().filter(
            sla_deadline__lt=timezone.now(),
            status__in=['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER']
        )
        page = self.paginate_queryset(tickets)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(tickets, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def urgent(self, request):
        """Get urgent tickets"""
        tickets = self.get_queryset().filter(
            priority__in=['URGENT', 'CRITICAL']
        )
        page = self.paginate_queryset(tickets)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(tickets, many=True)
        return Response(serializer.data)


class TicketMessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for TicketMessage
    """
    queryset = TicketMessage.objects.select_related(
        'ticket', 'user'
    ).prefetch_related('attachments').all()
    
    serializer_class = TicketMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['ticket', 'message_type', 'is_read', 'is_internal']
    search_fields = ['message', 'ticket__reference', 'ticket__title']
    ordering_fields = ['created_at']
    ordering = ['created_at']
    
    def get_queryset(self):
        """Filter queryset based on user permissions"""
        queryset = super().get_queryset()
        
        # Staff can see all messages (except internal ones from other tickets)
        if self.request.user.is_staff:
            return queryset
        
        # Regular users can only see their own messages
        return queryset.filter(
            ticket__user=self.request.user,
            is_internal=False
        )
    
    def perform_create(self, serializer):
        """Set user and IP when creating message"""
        request = self.request
        serializer.save(
            user=request.user,
            message_ip=self._get_client_ip(request)
        )
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class TicketAttachmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for TicketAttachment
    """
    queryset = TicketAttachment.objects.select_related('ticket', 'message').all()
    serializer_class = TicketAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['ticket', 'message', 'file_type']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter queryset based on user permissions"""
        queryset = super().get_queryset()
        
        # Staff can see all attachments
        if self.request.user.is_staff:
            return queryset
        
        # Regular users can only see attachments from their tickets
        return queryset.filter(ticket__user=self.request.user)
    
    def perform_create(self, serializer):
        """Set ticket and validate ownership"""
        ticket_id = self.request.data.get('ticket')
        if ticket_id:
            try:
                ticket = Ticket.objects.get(pk=ticket_id)
                # Check permission
                if not self.request.user.is_staff and ticket.user != self.request.user:
                    raise permissions.PermissionDenied('شما دسترسی به این تیکت ندارید.')
                serializer.save(ticket=ticket)
            except Ticket.DoesNotExist:
                raise serializers.ValidationError('تیکت یافت نشد.')
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def security_contact_info(request):
    """
    Get security contact phone number
    This endpoint returns the phone number for security department
    """
    phone = getattr(settings, 'SECURITY_CONTACT_PHONE', '021123456789')
    return Response({
        'phone': phone,
        'department': 'حراست',
        'message': 'برای ارتباط با حراست با شماره بالا تماس بگیرید.'
    })
