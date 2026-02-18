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
from django.db import models
from .models import Ticket, TicketMessage, TicketAttachment, TicketCategory, ChatMessage, ComplaintForm
from .permissions import IsTicketOwnerOrStaff
from .serializers import (
    TicketSerializer,
    TicketDetailSerializer,
    TicketCreateSerializer,
    TicketUpdateSerializer,
    TicketMessageSerializer,
    TicketAttachmentSerializer,
    TicketCategorySerializer,
    ChatMessageSerializer,
    ChatMessageCreateSerializer,
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


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def submit_complaint_form(request):
    """
    Submit complaint/suggestion form - no auth required
    Saves to ComplaintForm and emails all COMPLAINT_NOTIFICATION_EMAILS
    """
    from django.core.mail import send_mail
    from django.conf import settings
    
    data = request.data
    required = ['complaint_type', 'complaint_subject', 'first_name', 'last_name', 'mobile', 'email']
    for field in required:
        if not data.get(field):
            return Response(
                {'error': f'فیلد {field} الزامی است.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Get client IP
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')
    
    # Create complaint - user is optional
    user = request.user if request.user.is_authenticated else None
    complaint = ComplaintForm.objects.create(
        complaint_type=data.get('complaint_type', ''),
        complaint_subject=data.get('complaint_subject', ''),
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', ''),
        national_id=data.get('national_id', ''),
        mobile=data.get('mobile', ''),
        email=data.get('email', ''),
        origin=data.get('origin', ''),
        destination=data.get('destination', ''),
        flight_date=data.get('flight_date', ''),
        ticket_number=data.get('ticket_number', ''),
        flight_number=data.get('flight_number', ''),
        description=data.get('description', ''),
        user=user,
        submission_ip=ip,
    )
    
    # ارسال ایمیل اعلان (همزمان - timeout فرانت ۳۰ ثانیه است)
    recipient_list = getattr(settings, 'COMPLAINT_NOTIFICATION_EMAILS', ['info@nasimair.com'])
    if recipient_list:
        try:
            from_email = settings.EMAIL_HOST_USER or settings.DEFAULT_FROM_EMAIL
            email_body = f"""
شکایت/پیشنهاد جدید ثبت شد:

نوع شکایت: {complaint.complaint_type}
موضوع شکایت: {complaint.complaint_subject}

اطلاعات شخصی:
نام: {complaint.first_name} {complaint.last_name}
کدملی: {complaint.national_id or ''}
تلفن: {complaint.mobile}
ایمیل: {complaint.email}

اطلاعات پرواز:
مبدا: {complaint.origin or ''}
مقصد: {complaint.destination or ''}
تاریخ: {complaint.flight_date or ''}
شماره بلیت: {complaint.ticket_number or ''}
شماره پرواز: {complaint.flight_number or ''}

توضیحات:
{complaint.description or ''}

---
تاریخ ثبت: {complaint.created_at}
"""
            send_mail(
                subject=f"شکایت جدید - {complaint.complaint_type[:50]}",
                message=email_body,
                from_email=from_email,
                recipient_list=list(recipient_list),
                fail_silently=True,
            )
        except Exception:
            pass  # شکایت ذخیره شده؛ عدم ارسال ایمیل باعث خطا نشود
    
    return Response({
        'success': True,
        'message': 'شکایت شما با موفقیت ثبت شد.',
        'uuid': str(complaint.uuid),
    }, status=status.HTTP_201_CREATED)


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


class ChatMessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ChatMessage - Online chat support
    """
    queryset = ChatMessage.objects.all()
    permission_classes = [permissions.AllowAny]  # Allow both authenticated and guest users
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['is_staff', 'is_read', 'session_id']
    ordering_fields = ['created_at']
    ordering = ['created_at']
    
    def get_serializer_class(self):
        """Use different serializer for create"""
        if self.action == 'create':
            return ChatMessageCreateSerializer
        return ChatMessageSerializer
    
    def get_queryset(self):
        """Filter messages based on user or session - SECURE VERSION"""
        from django.utils import timezone
        
        queryset = super().get_queryset()
        
        # فیلتر کردن پیام‌های منقضی شده
        queryset = queryset.filter(
            models.Q(expires_at__isnull=True) | models.Q(expires_at__gt=timezone.now())
        )
        
        # اگر کاربر لاگین باشد
        if self.request.user.is_authenticated:
            # دریافت session_id از query params
            session_id = self.request.query_params.get('session_id')
            
            if session_id:
                # اطمینان از اینکه session_id متعلق به این کاربر است
                # session_id باید با user_id شروع شود: "user_{user_id}_..."
                if not session_id.startswith(f"user_{self.request.user.id}_"):
                    # session_id متعلق به این کاربر نیست - دسترسی رد می‌شود
                    return queryset.none()
                
                # فقط پیام‌های این کاربر با این session_id + پیام‌های پرسنل با همین session_id
                return queryset.filter(
                    models.Q(session_id=session_id) & (
                        models.Q(user=self.request.user) | models.Q(is_staff=True)
                    )
                )
            else:
                # اگر session_id نباشد، فقط پیام‌های این کاربر را نشان می‌دهیم
                # و پیام‌های پرسنل که session_id آنها با session_id پیام‌های کاربر مطابقت دارد
                user_messages = queryset.filter(
                    user=self.request.user
                ).exclude(session_id__isnull=True).exclude(session_id='')
                
                # فقط session_id هایی که متعلق به این کاربر هستند
                valid_session_ids = []
                for msg in user_messages:
                    if msg.session_id and msg.session_id.startswith(f"user_{self.request.user.id}_"):
                        valid_session_ids.append(msg.session_id)
                
                if valid_session_ids:
                    # پیام‌های کاربر + پیام‌های پرسنل با session_id مشابه
                    return queryset.filter(
                        models.Q(user=self.request.user) | 
                        (models.Q(is_staff=True) & models.Q(session_id__in=valid_session_ids))
                    )
                else:
                    # اگر session_id وجود نداشته باشد، فقط پیام‌های کاربر را نشان می‌دهیم
                    return queryset.filter(user=self.request.user)
        
        # اگر کاربر مهمان باشد
        session_id = self.request.query_params.get('session_id')
        if not session_id:
            # مهمانان باید session_id داشته باشند
            return queryset.none()
        
        # اطمینان از اینکه session_id متعلق به مهمان است (با "guest_" شروع می‌شود)
        if not session_id.startswith('guest_'):
            # session_id معتبر نیست
            return queryset.none()
        
        # فقط پیام‌های با این session_id (چه از مهمان چه از پرسنل)
        # اما باید مطمئن شویم که مهمان نمی‌تواند session_id دیگران را ببیند
        # این کار با بررسی IP یا سایر روش‌ها انجام می‌شود
        # برای سادگی، فقط session_id را چک می‌کنیم
        return queryset.filter(session_id=session_id)
    
    def perform_create(self, serializer):
        """Set user, IP, and session when creating message"""
        from django.utils import timezone
        from datetime import timedelta
        
        request = self.request
        
        # اگر کاربر لاگین باشد
        if request.user.is_authenticated:
            # برای کاربران لاگین، session_id را از request می‌گیریم یا یک session_id منحصر به فرد ایجاد می‌کنیم
            session_id = request.data.get('session_id')
            if not session_id:
                # ایجاد session_id منحصر به فرد برای کاربر (بر اساس user_id)
                import uuid
                # استفاده از user_id برای ایجاد session_id یکتا
                session_id = f"user_{request.user.id}_{uuid.uuid4().hex[:8]}"
            
            # برای کاربران عضو: is_staff باید False باشد (مگر اینکه واقعاً staff باشند و از پنل ادمین پیام بفرستند)
            # اما چون این از frontend است، همیشه False است
            is_staff_value = False  # کاربران عادی از frontend همیشه False هستند
            
            # Expiry: 72 ساعت برای کاربران عضو
            expires_at = timezone.now() + timedelta(hours=72)
            
            save_kwargs = {
                'user': request.user,
                'message_ip': self._get_client_ip(request),
                'is_staff': is_staff_value,
                'session_id': session_id,
                'expires_at': expires_at,
            }
            if serializer.validated_data.get('metadata'):
                save_kwargs['metadata'] = serializer.validated_data['metadata']
            serializer.save(**save_kwargs)
        else:
            # برای کاربران مهمان
            session_id = request.data.get('session_id') or self._generate_session_id(request)
            
            # برای مهمانان: is_staff همیشه False است
            # Expiry: تا زمانی که از سایت خارج نشده (24 ساعت - می‌توان بعداً با session tracking بهبود داد)
            expires_at = timezone.now() + timedelta(hours=24)
            
            save_kwargs = {
                'message_ip': self._get_client_ip(request),
                'session_id': session_id,
                'is_staff': False,
                'expires_at': expires_at,
            }
            if serializer.validated_data.get('metadata'):
                save_kwargs['metadata'] = serializer.validated_data['metadata']
            serializer.save(**save_kwargs)
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def _generate_session_id(self, request):
        """Generate session ID for guest users"""
        import uuid
        import time
        # Try to get existing session ID from request
        session_id = request.data.get('session_id')
        if not session_id:
            # Generate new session ID with guest_ prefix
            timestamp = int(time.time() * 1000)  # milliseconds
            unique_id = uuid.uuid4().hex[:8]
            session_id = f"guest_{timestamp}_{unique_id}"
        # Ensure it starts with guest_
        elif not session_id.startswith('guest_'):
            # If provided session_id doesn't start with guest_, generate a new one
            timestamp = int(time.time() * 1000)
            unique_id = uuid.uuid4().hex[:8]
            session_id = f"guest_{timestamp}_{unique_id}"
        return session_id
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def recent(self, request):
        """
        Get recent messages (for polling)
        """
        # Get last message timestamp from query params
        last_message_time = request.query_params.get('last_message_time')
        
        queryset = self.get_queryset()
        
        # Filter messages after last_message_time
        if last_message_time:
            try:
                from django.utils.dateparse import parse_datetime
                last_time = parse_datetime(last_message_time)
                if last_time:
                    queryset = queryset.filter(created_at__gt=last_time)
            except:
                pass
        
        # مرتب‌سازی بر اساس created_at
        queryset = queryset.order_by('created_at')
        
        # Get last 50 messages
        queryset = queryset[:50]
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def mark_read(self, request):
        """
        Mark messages as read (staff only)
        """
        message_ids = request.data.get('message_ids', [])
        if message_ids:
            ChatMessage.objects.filter(
                uuid__in=message_ids,
                is_read=False
            ).update(is_read=True)
        
        return Response({'status': 'success'})
