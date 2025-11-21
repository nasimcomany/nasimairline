"""
Serializers for main app
"""
from rest_framework import serializers
from .models import Project, Ticket
from django.contrib.auth import get_user_model

User = get_user_model()


class ProjectSerializer(serializers.ModelSerializer):
    """
    Serializer for Project model
    """
    assigned_to_email = serializers.EmailField(
        source='project_assigned_to.email',
        read_only=True,
        allow_null=True
    )
    deleted_by_email = serializers.EmailField(
        source='project_deleted_by.email',
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = Project
        fields = [
            'id', 'project_id', 'project_name', 'project_description',
            'project_created_at', 'project_updated_at', 'project_status',
            'project_type', 'project_priority', 'project_assigned_to',
            'assigned_to_email', 'project_start_date', 'project_end_date',
            'project_budget', 'project_progress', 'project_completed',
            'project_deleted', 'project_deleted_at', 'project_deleted_by',
            'deleted_by_email', 'project_deleted_reason',
            'project_deleted_comment'
        ]
        read_only_fields = [
            'id', 'project_created_at', 'project_updated_at',
            'project_deleted_at', 'assigned_to_email', 'deleted_by_email'
        ]


class ProjectDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for Project model
    """
    assigned_to_detail = serializers.SerializerMethodField()
    deleted_by_detail = serializers.SerializerMethodField()
    ticket_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'project_id', 'project_name', 'project_description',
            'project_created_at', 'project_updated_at', 'project_status',
            'project_type', 'project_priority', 'project_assigned_to',
            'assigned_to_detail', 'project_start_date', 'project_end_date',
            'project_budget', 'project_progress', 'project_completed',
            'project_deleted', 'project_deleted_at', 'project_deleted_by',
            'deleted_by_detail', 'project_deleted_reason',
            'project_deleted_comment', 'ticket_count'
        ]
        read_only_fields = [
            'id', 'project_created_at', 'project_updated_at',
            'project_deleted_at', 'assigned_to_detail', 'deleted_by_detail',
            'ticket_count'
        ]
    
    def get_assigned_to_detail(self, obj):
        """Get assigned user details"""
        if obj.project_assigned_to:
            return {
                'id': obj.project_assigned_to.id,
                'email': obj.project_assigned_to.email,
                'full_name': obj.project_assigned_to.get_full_name()
            }
        return None
    
    def get_deleted_by_detail(self, obj):
        """Get deleted by user details"""
        if obj.project_deleted_by:
            return {
                'id': obj.project_deleted_by.id,
                'email': obj.project_deleted_by.email,
                'full_name': obj.project_deleted_by.get_full_name()
            }
        return None
    
    def get_ticket_count(self, obj):
        """Get ticket count for project"""
        return obj.ticket_set.count()


class TicketSerializer(serializers.ModelSerializer):
    """
    Serializer for Ticket model
    """
    assigned_to_email = serializers.EmailField(
        source='assigned_to.email',
        read_only=True,
        allow_null=True
    )
    project_name = serializers.CharField(
        source='project.project_name',
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'ticket_id', 'title', 'description', 'created_at',
            'updated_at', 'status', 'priority', 'assigned_to',
            'assigned_to_email', 'project', 'project_name',
            'ticket_type', 'ticket_status', 'ticket_category',
            'ticket_subcategory', 'ticket_severity', 'ticket_source',
            'ticket_source_id', 'ticket_source_url', 'ticket_source_type'
        ]
        read_only_fields = [
            'id', 'ticket_id', 'created_at', 'updated_at',
            'assigned_to_email', 'project_name'
        ]


class TicketDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for Ticket model
    """
    assigned_to_detail = serializers.SerializerMethodField()
    project_detail = ProjectSerializer(source='project', read_only=True)
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'ticket_id', 'title', 'description', 'created_at',
            'updated_at', 'status', 'priority', 'assigned_to',
            'assigned_to_detail', 'project', 'project_detail',
            'ticket_type', 'ticket_status', 'ticket_category',
            'ticket_subcategory', 'ticket_severity', 'ticket_source',
            'ticket_source_id', 'ticket_source_url', 'ticket_source_type'
        ]
        read_only_fields = [
            'id', 'ticket_id', 'created_at', 'updated_at',
            'assigned_to_detail', 'project_detail'
        ]
    
    def get_assigned_to_detail(self, obj):
        """Get assigned user details"""
        if obj.assigned_to:
            return {
                'id': obj.assigned_to.id,
                'email': obj.assigned_to.email,
                'full_name': obj.assigned_to.get_full_name()
            }
        return None
