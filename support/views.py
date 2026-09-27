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
from nasim.email_recipients import merge_notification_emails
from .models import Ticket, TicketMessage, TicketAttachment, TicketCategory, ChatMessage, ComplaintForm, SurveyForm, CabinSafetyReportForm, SafetyHazardReportForm
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
    from nasim.async_utils import enqueue
    from notifications.tasks import send_email_task
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
    
    # ارسال ایمیل اعلان - چندزبان (fa/en/ar) و تمام فیلدها
    lang = (data.get('language') or 'fa').lower()
    if lang not in ('fa', 'en', 'ar'):
        lang = 'fa'
    from .email_i18n import get_labels
    L = get_labels(lang, 'complaint')

    recipient_list = merge_notification_emails(
        getattr(settings, 'COMPLAINT_NOTIFICATION_EMAILS', []),
        'publicrelation@nasimair.com',
    )
    if recipient_list:
        try:
            from_email = settings.EMAIL_HOST_USER or settings.DEFAULT_FROM_EMAIL
            email_body = f"""
{L['title']}

{L['type']} {complaint.complaint_type}
{L['subject']} {complaint.complaint_subject}

{L['personal']}
{L['first_name']} {complaint.first_name}
{L['last_name']} {complaint.last_name}
{L['national_id']} {complaint.national_id or '—'}
{L['mobile']} {complaint.mobile}
{L['email']} {complaint.email}

{L['flight_info']}
{L['origin']} {complaint.origin or '—'}
{L['destination']} {complaint.destination or '—'}
{L['flight_date']} {complaint.flight_date or '—'}
{L['ticket_number']} {complaint.ticket_number or '—'}
{L['flight_number']} {complaint.flight_number or '—'}

{L['description']}
{complaint.description or '—'}

---
{L['submitted_at']} {complaint.created_at}
"""
            enqueue(send_email_task, f"{L['subject_prefix']} {complaint.complaint_type[:50]}", email_body, list(recipient_list), from_email, True)
        except Exception:
            pass  # شکایت ذخیره شده؛ عدم ارسال ایمیل باعث خطا نشود
    
    return Response({
        'success': True,
        'message': 'شکایت شما با موفقیت ثبت شد.',
        'uuid': str(complaint.uuid),
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def submit_survey_form(request):
    """
    Submit survey form - no auth required
    Saves to SurveyForm and emails SURVEY_NOTIFICATION_EMAILS (or COMPLAINT_NOTIFICATION_EMAILS)
    """
    from nasim.async_utils import enqueue
    from notifications.tasks import send_email_task

    data = request.data
    required = ['full_name', 'flight_number', 'contact_number']
    for field in required:
        if not data.get(field):
            return Response(
                {'error': f'فیلد {field} الزامی است.'},
                status=status.HTTP_400_BAD_REQUEST
            )

    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')

    survey = SurveyForm.objects.create(
        full_name=data.get('full_name', ''),
        seat_number=data.get('seat_number', ''),
        age=data.get('age', ''),
        education=data.get('education', ''),
        flight_number=data.get('flight_number', ''),
        contact_number=data.get('contact_number', ''),
        email=data.get('email', ''),
        flight_route=data.get('flight_route', ''),
        ticketing_website=data.get('ticketing_website', ''),
        trips_with_nasim=data.get('trips_with_nasim', ''),
        annual_flights=data.get('annual_flights', ''),
        travel_purpose=data.get('travel_purpose', ''),
        nasim_choice_reason=data.get('nasim_choice_reason', ''),
        station_staff_rating=data.get('station_staff_rating', ''),
        cabin_hygiene_rating=data.get('cabin_hygiene_rating', ''),
        seat_comfort_rating=data.get('seat_comfort_rating', ''),
        cabin_temp_rating=data.get('cabin_temp_rating', ''),
        attendants_service_rating=data.get('attendants_service_rating', ''),
        attendants_appearance_rating=data.get('attendants_appearance_rating', ''),
        sound_system_rating=data.get('sound_system_rating', ''),
        catering_quality_rating=data.get('catering_quality_rating', ''),
        pilot_communication_rating=data.get('pilot_communication_rating', ''),
        on_time_rating=data.get('on_time_rating', ''),
        vs_domestic_rating=data.get('vs_domestic_rating', ''),
        recommend_nasim=data.get('recommend_nasim', ''),
        suggestions=data.get('suggestions', ''),
        submission_ip=ip,
    )

    lang = (data.get('language') or 'fa').lower()
    if lang not in ('fa', 'en', 'ar'):
        lang = 'fa'
    from .email_i18n import get_labels, get_survey_label
    L = get_labels(lang, 'survey')

    def lbl(v):
        return get_survey_label(v, lang)

    base_list = getattr(settings, 'SURVEY_NOTIFICATION_EMAILS', None) or getattr(settings, 'COMPLAINT_NOTIFICATION_EMAILS', [])
    recipient_list = merge_notification_emails(base_list, 'publicrelation@nasimair.com')
    if recipient_list:
        try:
            from_email = settings.EMAIL_HOST_USER or settings.DEFAULT_FROM_EMAIL
            email_body = f"""
{L['title']}

{L['personal']}
{L['full_name']} {survey.full_name}
{L['seat_number']} {survey.seat_number or '—'}
{L['age']} {survey.age or '—'}
{L['education']} {survey.education or '—'}
{L['flight_number']} {survey.flight_number}
{L['contact_number']} {survey.contact_number}
{L['email']} {survey.email or '—'}
{L['flight_route']} {survey.flight_route or '—'}
{L['ticketing_website']} {survey.ticketing_website or '—'}

{L['questions']}
{L['trips_with_nasim']} {lbl(survey.trips_with_nasim)}
{L['annual_flights']} {lbl(survey.annual_flights)}
{L['travel_purpose']} {lbl(survey.travel_purpose)}
{L['nasim_choice_reason']} {lbl(survey.nasim_choice_reason)}

{L['ratings']}
{L['station_staff_rating']} {lbl(survey.station_staff_rating)}
{L['cabin_hygiene_rating']} {lbl(survey.cabin_hygiene_rating)}
{L['seat_comfort_rating']} {lbl(survey.seat_comfort_rating)}
{L['cabin_temp_rating']} {lbl(survey.cabin_temp_rating)}
{L['attendants_service_rating']} {lbl(survey.attendants_service_rating)}
{L['attendants_appearance_rating']} {lbl(survey.attendants_appearance_rating)}
{L['sound_system_rating']} {lbl(survey.sound_system_rating)}
{L['catering_quality_rating']} {lbl(survey.catering_quality_rating)}
{L['pilot_communication_rating']} {lbl(survey.pilot_communication_rating)}
{L['on_time_rating']} {lbl(survey.on_time_rating)}
{L['vs_domestic_rating']} {lbl(survey.vs_domestic_rating)}

{L['recommend_nasim']} {lbl(survey.recommend_nasim)}

{L['suggestions']}
{survey.suggestions or '—'}

---
{L['submitted_at']} {survey.created_at}
"""
            enqueue(send_email_task, f"{L['subject_prefix']} {survey.full_name} - {survey.flight_number}", email_body, list(recipient_list), from_email, True)
        except Exception:
            pass

    return Response({
        'success': True,
        'message': 'نظرسنجی شما با موفقیت ثبت شد.',
        'uuid': str(survey.uuid),
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_cabin_safety_form(request):
    """
    گزارش اجباری ایمنی کابین - فقط برای پرسنل (is_staff)
    """
    from nasim.async_utils import enqueue
    from notifications.tasks import send_email_task

    if not request.user.is_staff:
        return Response({'error': 'فقط پرسنل مجاز به ثبت این فرم هستند.'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data
    required = ['reporter_name', 'reporter_family']
    for field in required:
        if not data.get(field):
            return Response(
                {'error': f'فیلد {field} الزامی است.'},
                status=status.HTTP_400_BAD_REQUEST
            )

    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')

    report = CabinSafetyReportForm.objects.create(
        reporter_name=data.get('reporter_name', ''),
        reporter_family=data.get('reporter_family', ''),
        protect_personal_info=bool(data.get('protect_personal_info')),
        occurrence_day=data.get('occurrence_day', ''),
        occurrence_month=data.get('occurrence_month', ''),
        occurrence_year=data.get('occurrence_year', ''),
        time_utc=data.get('time_utc', ''),
        time_local=data.get('time_local', ''),
        time_of_day=data.get('time_of_day', ''),
        route_from=data.get('route_from', ''),
        route_to=data.get('route_to', ''),
        ac_type=data.get('ac_type', ''),
        ac_registration=data.get('ac_registration', ''),
        crew_count=data.get('crew_count', ''),
        pax_count=data.get('pax_count', ''),
        flight_number=data.get('flight_number', ''),
        flight_phase=data.get('flight_phase') if isinstance(data.get('flight_phase'), list) else [],
        occurrence_type_37=data.get('occurrence_type_37') if isinstance(data.get('occurrence_type_37'), list) else [],
        occurrence_type_b=data.get('occurrence_type_b') if isinstance(data.get('occurrence_type_b'), list) else [],
        occurrence_type_c=data.get('occurrence_type_c') if isinstance(data.get('occurrence_type_c'), list) else [],
        occurrence_type_d=data.get('occurrence_type_d') if isinstance(data.get('occurrence_type_d'), list) else [],
        occurrence_type_e=data.get('occurrence_type_e') if isinstance(data.get('occurrence_type_e'), list) else [],
        description=data.get('description', ''),
        other_info_suggestions=data.get('other_info_suggestions', ''),
        submission_ip=ip,
        user=request.user,
    )

    lang = (data.get('language') or 'fa').lower()
    if lang not in ('fa', 'en', 'ar'):
        lang = 'fa'
    from .email_i18n import get_labels, get_cabin_time_of_day
    L = get_labels(lang, 'cabin')
    yes_no = {'fa': ('بله', 'خیر'), 'en': ('Yes', 'No'), 'ar': ('نعم', 'لا')}
    yn = yes_no.get(lang, yes_no['fa'])

    def fmt_list(lst):
        return ', '.join(lst) if lst else '—'

    base_list = getattr(settings, 'CABIN_SAFETY_NOTIFICATION_EMAILS', None) or getattr(settings, 'COMPLAINT_NOTIFICATION_EMAILS', [])
    recipient_list = merge_notification_emails(base_list, 'safety@nasimair.com')
    if recipient_list:
        try:
            from_email = settings.EMAIL_HOST_USER or settings.DEFAULT_FROM_EMAIL
            email_body = f"""
{L['title']}

{L['reporter']}
{L['name']} {report.reporter_name}
{L['family']} {report.reporter_family}
{L['protect_info']} {yn[0] if report.protect_personal_info else yn[1]}

{L['event_date']} {report.occurrence_day or '—'}/{report.occurrence_month or '—'}/{report.occurrence_year or '—'}
{L['time_utc']} {report.time_utc or '—'}
{L['time_local']} {report.time_local or '—'}
{L['time_of_day']} {get_cabin_time_of_day(report.time_of_day, lang)}

{L['flight_details']}
{L['route_from']} {report.route_from or '—'}
{L['route_to']} {report.route_to or '—'}
{L['ac_type']} {report.ac_type or '—'}
{L['ac_reg']} {report.ac_registration or '—'}
{L['crew_count']} {report.crew_count or '—'}
{L['pax_count']} {report.pax_count or '—'}
{L['flight_number']} {report.flight_number or '—'}
{L['flight_phase']} {fmt_list(report.flight_phase)}

{L['occurrence_37']} {fmt_list(report.occurrence_type_37)}
{L['occurrence_b']} {fmt_list(report.occurrence_type_b)}
{L['occurrence_c']} {fmt_list(report.occurrence_type_c)}
{L['occurrence_d']} {fmt_list(report.occurrence_type_d)}
{L['occurrence_e']} {fmt_list(report.occurrence_type_e)}

{L['description']}
{report.description or '—'}

{L['other_info']}
{report.other_info_suggestions or '—'}

---
{L['submitted_at']} {report.created_at}
"""
            enqueue(send_email_task, f"{L['subject_prefix']} {report.reporter_name} {report.reporter_family} - {report.flight_number or '—'}", email_body, list(recipient_list), from_email, True)
        except Exception:
            pass

    return Response({
        'success': True,
        'message': 'گزارش ایمنی کابین با موفقیت ثبت شد.',
        'uuid': str(report.uuid),
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_safety_hazard_form(request):
    """
    گزارش مخاطرات ایمنی (SHOR) - فقط برای پرسنل (is_staff)
    """
    from nasim.async_utils import enqueue
    from notifications.tasks import send_email_task

    if not request.user.is_staff:
        return Response({'error': 'فقط پرسنل مجاز به ثبت این فرم هستند.'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data
    if not data.get('reporter_name', '').strip():
        return Response({'error': 'نام و نام خانوادگی الزامی است.'}, status=status.HTTP_400_BAD_REQUEST)

    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')

    director_actions = data.get('director_actions')
    if not isinstance(director_actions, dict):
        director_actions = {}

    report = SafetyHazardReportForm.objects.create(
        reporter_name=data.get('reporter_name', '').strip(),
        section=data.get('section', ''),
        tel=data.get('tel', ''),
        report_date=data.get('report_date', ''),
        report_number=data.get('report_number', ''),
        ac_registration=data.get('ac_registration', ''),
        type_of_hazard=data.get('type_of_hazard') if isinstance(data.get('type_of_hazard'), list) else [],
        type_of_hazard_others=data.get('type_of_hazard_others', ''),
        spec_time=data.get('spec_time', ''),
        spec_date=data.get('spec_date', ''),
        spec_location=data.get('spec_location', ''),
        hazard_description=data.get('hazard_description', ''),
        safety_director_decision=data.get('safety_director_decision', ''),
        director_actions=director_actions,
        director_name=data.get('director_name', ''),
        sign_and_date=data.get('sign_and_date', ''),
        submission_ip=ip,
        user=request.user,
    )

    lang = (data.get('language') or 'fa').lower()
    if lang not in ('fa', 'en', 'ar'):
        lang = 'fa'
    from .email_i18n import get_labels
    L = get_labels(lang, 'safety_hazard')

    base_list = getattr(settings, 'SAFETY_HAZARD_NOTIFICATION_EMAILS', None) or getattr(settings, 'COMPLAINT_NOTIFICATION_EMAILS', [])
    recipient_list = merge_notification_emails(base_list, 'safety@nasimair.com')
    if recipient_list:
        try:
            from_email = settings.EMAIL_HOST_USER or settings.DEFAULT_FROM_EMAIL
            email_body = f"""
{L['title']}

{L['reporter_name']} {report.reporter_name}
{L['section']} {report.section or '—'}
{L['tel']} {report.tel or '—'}
{L['report_date']} {report.report_date or '—'}
{L['report_number']} {report.report_number or '—'}
{L['ac_registration']} {report.ac_registration or '—'}

{L['type_of_hazard']} {', '.join(report.type_of_hazard) if report.type_of_hazard else '—'}
{L['others']} {report.type_of_hazard_others or '—'}

{L['hazard_specs']}
{L['spec_time']} {report.spec_time or '—'}
{L['spec_date']} {report.spec_date or '—'}
{L['spec_location']} {report.spec_location or '—'}

{L['description']}
{report.hazard_description or '—'}

{L['director_decision']}
{report.safety_director_decision or '—'}

{L['director_actions']} {str(report.director_actions) if report.director_actions else '—'}
{L['director_name']} {report.director_name or '—'}
{L['sign_and_date']} {report.sign_and_date or '—'}

---
{L['submitted_at']} {report.created_at}
"""
            enqueue(send_email_task, f"{L['subject_prefix']} {report.reporter_name[:50]}", email_body, list(recipient_list), from_email, True)
        except Exception:
            pass

    return Response({
        'success': True,
        'message': 'گزارش مخاطرات ایمنی با موفقیت ثبت شد.',
        'uuid': str(report.uuid),
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


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def weather_proxy(request):
    """
    پروکسی آب و هوا - درخواست از سرور به OpenWeatherMap (بدون CORS)
    Query params: cities=Tehran,Mashhad,Kish (comma-separated), lang=fa|en|ar
    """
    import requests
    api_key = getattr(settings, 'WEATHER_API_KEY', '')
    if not api_key:
        return Response({'error': 'API Key تنظیم نشده'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    cities_param = request.query_params.get('cities', 'Tehran,Mashhad,Kish,Abadan,Isfahan')
    cities = [c.strip() for c in cities_param.split(',') if c.strip()]
    lang = request.query_params.get('lang', 'fa')
    if lang not in ('fa', 'en', 'ar'):
        lang = 'en'

    results = []
    for city in cities:
        try:
            url = f'https://api.openweathermap.org/data/2.5/weather?q={city},IR&units=metric&lang={lang}&appid={api_key}'
            r = requests.get(url, timeout=8)
            if r.status_code != 200:
                results.append({'city': city, 'error': 'خطا در دریافت', 'temperature': 0, 'description': '', 'icon': '', 'humidity': 0, 'windSpeed': 0})
                continue
            data = r.json()
            results.append({
                'city': city,
                'temperature': round(data.get('main', {}).get('temp', 0)),
                'description': data.get('weather', [{}])[0].get('description', ''),
                'icon': data.get('weather', [{}])[0].get('icon', '01d'),
                'humidity': data.get('main', {}).get('humidity', 0),
                'windSpeed': round(data.get('wind', {}).get('speed', 0) * 3.6),
                'error': None,
            })
        except Exception:
            results.append({'city': city, 'error': 'خطا در دریافت', 'temperature': 0, 'description': '', 'icon': '', 'humidity': 0, 'windSpeed': 0})

    return Response({'data': results})


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
