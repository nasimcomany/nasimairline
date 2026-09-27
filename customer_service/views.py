"""
Views for customer_service app
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import (
    CustomerTierSettings,
    ChatSession,
    ChatMessage,
    FlightMealFeedback,
)
from .serializers import (
    CustomerTierSettingsSerializer,
    ChatSessionSerializer,
    ChatSessionListSerializer,
    ChatMessageSerializer,
    CustomerTierInfoSerializer,
    FlightMealFeedbackSerializer,
    FlightMealFeedbackListSerializer,
)
from .utils import (
    calculate_customer_tier,
    get_customer_tier_info,
    generate_session_id,
)
from .constants import (
    MESSAGE_TYPE_CUSTOMER,
    MESSAGE_TYPE_STAFF,
    CHAT_STATUS_IN_PROGRESS,
    CHAT_STATUS_CLOSED,
)

User = get_user_model()


class CustomerTierSettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CustomerTierSettings (Admin only)
    """
    queryset = CustomerTierSettings.objects.all()
    serializer_class = CustomerTierSettingsSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['tier', 'criteria_type', 'is_active']
    search_fields = ['description']
    ordering_fields = ['priority', 'created_at']
    ordering = ['-priority', 'tier']


class ChatSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ChatSession
    """
    queryset = ChatSession.objects.select_related('user', 'assigned_to').prefetch_related('messages')
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'customer_tier', 'assigned_to']
    search_fields = ['guest_name', 'guest_email', 'session_id']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return ChatSessionListSerializer
        return ChatSessionSerializer
    
    def get_queryset(self):
        """Filter queryset based on user"""
        queryset = super().get_queryset()
        
        # Staff can see all sessions
        if self.request.user.is_staff:
            return queryset
        
        # Regular users can only see their own sessions
        return queryset.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Create chat session"""
        # Auto-set user if authenticated
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def create_guest_session(self, request):
        """
        Create a chat session for guest users (not logged in)
        """
        guest_name = request.data.get('guest_name')
        guest_email = request.data.get('guest_email')
        
        if not guest_name or not guest_email:
            return Response(
                {'error': 'نام و ایمیل مهمان الزامی است'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session_id = generate_session_id()
        
        session = ChatSession.objects.create(
            guest_name=guest_name,
            guest_email=guest_email,
            session_id=session_id,
            customer_tier='BRONZE',  # Default for guests
            client_ip=request.META.get('REMOTE_ADDR'),
        )
        
        serializer = ChatSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get all messages for a chat session"""
        session = self.get_object()
        
        # Check permissions
        if not request.user.is_staff and session.user != request.user:
            return Response(
                {'error': 'شما دسترسی به این نشست ندارید'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        messages = session.messages.all()
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Send a message in a chat session"""
        session = self.get_object()
        
        # Check permissions
        if not request.user.is_staff and session.user != request.user:
            return Response(
                {'error': 'شما دسترسی به این نشست ندارید'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        message_text = request.data.get('message')
        if not message_text:
            return Response(
                {'error': 'متن پیام الزامی است'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Determine message type
        if request.user.is_staff:
            message_type = MESSAGE_TYPE_STAFF
            # Update session status and assign if not assigned
            if not session.assigned_to:
                session.assigned_to = request.user
            if session.status != CHAT_STATUS_CLOSED:
                session.status = CHAT_STATUS_IN_PROGRESS
                session.save()
        else:
            message_type = MESSAGE_TYPE_CUSTOMER
        
        message = ChatMessage.objects.create(
            session=session,
            user=request.user if request.user.is_staff else None,
            message=message_text,
            message_type=message_type,
            message_ip=request.META.get('REMOTE_ADDR'),
        )
        
        serializer = ChatMessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def assign(self, request, pk=None):
        """Assign chat session to a staff member"""
        session = self.get_object()
        
        staff_id = request.data.get('staff_id')
        if not staff_id:
            return Response(
                {'error': 'شناسه پرسنل الزامی است'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            staff_user = User.objects.get(id=staff_id, is_staff=True)
        except User.DoesNotExist:
            return Response(
                {'error': 'پرسنل مورد نظر یافت نشد'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        session.assigned_to = staff_user
        session.status = CHAT_STATUS_IN_PROGRESS
        session.save()
        
        serializer = ChatSessionSerializer(session)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close a chat session"""
        session = self.get_object()
        
        # Check permissions
        if not request.user.is_staff and session.user != request.user:
            return Response(
                {'error': 'شما دسترسی به این نشست ندارید'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        session.close()
        serializer = ChatSessionSerializer(session)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def unassigned(self, request):
        """Get unassigned chat sessions (for staff)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'دسترسی مجاز نیست'},
                status=status.HTTP_403_FORBIDDEN
            )
        sessions = self.queryset.unassigned()
        serializer = ChatSessionListSerializer(sessions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def my_sessions(self, request):
        """Get chat sessions assigned to current staff member"""
        if not request.user.is_staff:
            return Response(
                {'error': 'دسترسی مجاز نیست'},
                status=status.HTTP_403_FORBIDDEN
            )
        sessions = self.queryset.filter(assigned_to=request.user)
        serializer = ChatSessionListSerializer(sessions, many=True)
        return Response(serializer.data)


class ChatMessageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for ChatMessage (read-only, messages are created via session endpoints)
    """
    queryset = ChatMessage.objects.select_related('session', 'user')
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['session', 'message_type', 'is_read']
    ordering_fields = ['created_at']
    ordering = ['created_at']
    
    def get_queryset(self):
        """Filter queryset based on user"""
        queryset = super().get_queryset()
        
        # Staff can see all messages
        if self.request.user.is_staff:
            return queryset
        
        # Regular users can only see messages from their own sessions
        return queryset.filter(session__user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a message as read"""
        message = self.get_object()
        
        # Only customer can mark staff messages as read
        if message.message_type == MESSAGE_TYPE_STAFF:
            message.is_read = True
            message.save()
        
        serializer = ChatMessageSerializer(message)
        return Response(serializer.data)


class CustomerTierViewSet(viewsets.ViewSet):
    """
    ViewSet for customer tier information
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def my_tier(self, request):
        """Get current user's tier information"""
        tier_info = get_customer_tier_info(request.user)
        serializer = CustomerTierInfoSerializer(tier_info)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def recalculate_all(self, request):
        """Recalculate tiers for all users (admin only)"""
        from accounts.models import User as AccountUser
        
        updated_count = 0
        for user in AccountUser.objects.all():
            old_tier = user.membership_level
            new_tier = calculate_customer_tier(user)
            
            if old_tier != new_tier:
                user.membership_level = new_tier
                user.save(update_fields=['membership_level'])
                updated_count += 1
        
        return Response({
            'message': f'{updated_count} کاربر به‌روزرسانی شدند',
            'updated_count': updated_count
        })


class FlightMealFeedbackViewSet(viewsets.ModelViewSet):
    """
    ViewSet for flight meal feedback
    - Allows anonymous users to submit feedback
    - List/retrieve requires admin authentication
    """
    queryset = FlightMealFeedback.objects.all()
    serializer_class = FlightMealFeedbackSerializer
    permission_classes = [permissions.AllowAny]  # Allow anonymous for POST
    lookup_field = 'uuid'
    
    def get_serializer_class(self):
        """Use list serializer for list action"""
        if self.action == 'list':
            return FlightMealFeedbackListSerializer
        return FlightMealFeedbackSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        - POST (create): AllowAny
        - GET, PUT, PATCH, DELETE: Admin only
        """
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def create(self, request, *args, **kwargs):
        """Create new feedback submission"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Email notification to admins
        try:
            from django.conf import settings
            from nasim.async_utils import enqueue
            from nasim.email_recipients import merge_notification_emails
            from notifications.tasks import send_email_task

            feedback = serializer.instance
            recipients = merge_notification_emails(
                getattr(settings, 'MEAL_FEEDBACK_NOTIFICATION_EMAILS', []),
            )
            if recipients:
                from_email = settings.EMAIL_HOST_USER or settings.DEFAULT_FROM_EMAIL
                body = (
                    f"بازخورد وعده غذایی جدید\n\n"
                    f"پرواز: {getattr(feedback, 'flight_number', None) or '—'}\n"
                    f"نام: {getattr(feedback, 'first_name', None) or ''} {getattr(feedback, 'last_name', None) or ''}\n"
                    f"کیفیت غذا: {getattr(feedback, 'food_quality', None) or '—'}\n"
                    f"دما: {getattr(feedback, 'food_temperature', None) or '—'}\n"
                    f"طعم: {getattr(feedback, 'food_taste', None) or '—'}\n"
                    f"نظر: {getattr(feedback, 'comments', None) or '—'}\n"
                )
                enqueue(
                    send_email_task,
                    'بازخورد وعده غذایی جدید',
                    body,
                    list(recipients),
                    from_email,
                    True,
                )
        except Exception:
            pass

        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                'message': 'بازخورد شما با موفقیت ثبت شد. از اینکه وقت گذاشتید متشکریم!',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def mark_reviewed(self, request, uuid=None):
        """Mark feedback as reviewed (admin only)"""
        feedback = self.get_object()
        feedback.is_reviewed = True
        feedback.reviewed_by = request.user
        feedback.reviewed_at = timezone.now()
        
        # Optional admin notes
        admin_notes = request.data.get('admin_notes', '')
        if admin_notes:
            feedback.admin_notes = admin_notes
        
        feedback.save()
        
        serializer = self.get_serializer(feedback)
        return Response({
            'message': 'بازخورد به عنوان بررسی شده علامت‌گذاری شد',
            'data': serializer.data
        })
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def statistics(self, request):
        """Get statistics about meal feedback (admin only)"""
        from django.db.models import Avg, Count
        
        total_feedbacks = FlightMealFeedback.objects.count()
        reviewed_count = FlightMealFeedback.objects.filter(is_reviewed=True).count()
        
        # Average ratings
        avg_ratings = FlightMealFeedback.objects.aggregate(
            avg_food_quality=Avg('food_quality'),
            avg_food_temperature=Avg('food_temperature'),
            avg_food_taste=Avg('food_taste'),
            avg_food_presentation=Avg('food_presentation'),
            avg_portion_size=Avg('portion_size'),
            avg_variety=Avg('variety'),
            avg_packaging=Avg('packaging'),
            avg_service_quality=Avg('service_quality'),
        )
        
        # Feedback count by flight number
        by_flight = FlightMealFeedback.objects.values('flight_number').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        return Response({
            'total_feedbacks': total_feedbacks,
            'reviewed_count': reviewed_count,
            'pending_review': total_feedbacks - reviewed_count,
            'average_ratings': avg_ratings,
            'top_flights_by_feedback': list(by_flight),
        })
