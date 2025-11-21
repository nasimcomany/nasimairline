from rest_framework import serializers
from main.models import Project, Ticket


class ProjectSerializer(serializer.ModelSerializers)
     class Meta:
        model = Project
        fields = ['id', 'project_id', 'project_name', 'project_description', 'project_created_at', 'project_updated_at', 'project_status', 'project_type', 'project_priority', 'project_assigned_to', 'project_start_date', 'project_end_date', 'project_budget', 'project_progress', 'project_completed', 'project_deleted', 'project_deleted_at', 'project_deleted_by', 'project_deleted_reason', 'project_deleted_comment'
        'created_at', 'updated_at', 'deleted_at', 'deleted_by', 'deleted_reason', 'deleted_comment' ]
        extra_kwargs = {
            'project_id': {'required': True, 'validators': [validate_project_id]},
            'project_name': {'required': True, 'validators': [validate_project_name]},
            'project_description': {'required': True, 'validators': [validate_project_description]},
            'created_at': {'required': True, 'validators': [validate_created_at]},
            'updated_at': {'required': True, 'validators': [validate_updated_at]},
            'deleted_at': {'required': True, 'validators': [validate_deleted_at]},
            'deleted_by': {'required': True, 'validators': [validate_deleted_by]},
            'deleted_reason': {'required': True, 'validators': [validate_deleted_reason]},
            'deleted_comment': {'required': True, 'validators': [validate_deleted_comment]},
        }

class TicketSerializer(serializer.ModelSerializers):
    class Meta:
        model = Ticket
        fields = ['id', 'ticket_id', 'title', 'description', 'created_at', 'updated_at', 'status', 'priority', 'assigned_to', 'project', 'ticket_type', 'ticket_status', 'ticket_category', 'ticket_subcategory', 'ticket_severity', 'ticket_source', 'ticket_source_id', 'ticket_source_url', 'ticket_source_type', 'created_at', 'updated_at', 'deleted_at', 'deleted_by', 'deleted_reason', 'deleted_comment']
        extra_kwargs = {
            'ticket_id': {'required': True, 'validators': [validate_ticket_id]},
            'title': {'required': True, 'validators': [validate_title]},
            'description': {'required': True, 'validators': [validate_description]},
            'created_at': {'required': True, 'validators': [validate_created_at]},
            'updated_at': {'required': True, 'validators': [validate_updated_at]},
            'deleted_at': {'required': True, 'validators': [validate_deleted_at]},
            'deleted_by': {'required': True, 'validators': [validate_deleted_by]},
            'deleted_reason': {'required': True, 'validators': [validate_deleted_reason]},
            'deleted_comment': {'required': True, 'validators': [validate_deleted_comment]},
        }

class TicketDetailSerializer(serializer.ModelSerializers):
    class Meta:
        model = Ticket
        fields = ['id', 'ticket_id', 'title', 'description', 'created_at', 'updated_at', 'status', 'priority', 'assigned_to', 'project', 'ticket_type', 'ticket_status', 'ticket_category', 'ticket_subcategory', 'ticket_severity', 'ticket_source', 'ticket_source_id', 'ticket_source_url', 'ticket_source_type', 'created_at', 'updated_at', 'deleted_at', 'deleted_by', 'deleted_reason', 'deleted_comment']
        extra_kwargs = {
            'ticket_id': {'required': True, 'validators': [validate_ticket_id]},
            'title': {'required': True, 'validators': [validate_title]},
            'description': {'required': True, 'validators': [validate_description]},
            'created_at': {'required': True, 'validators': [validate_created_at]},
            'updated_at': {'required': True, 'validators': [validate_updated_at]},
            'deleted_at': {'required': True, 'validators': [validate_deleted_at]},
        }

class ProjectDetailSerializer(serializer.ModelSerializers):
    class Meta:
        model = Project
        fields = ['id', 'project_id', 'project_name', 'project_description', 'project_created_at', 'project_updated_at', 'project_status', 'project_type', 'project_priority', 'project_assigned_to', 'project_start_date', 'project_end_date', 'project_budget', 'project_progress', 'project_completed', 'project_deleted', 'project_deleted_at', 'project_deleted_by', 'project_deleted_reason', 'project_deleted_comment']
        extra_kwargs = {
            'project_id': {'required': True, 'validators': [validate_project_id]},
            'project_name': {'required': True, 'validators': [validate_project_name]},
            'project_description': {'required': True, 'validators': [validate_project_description]},
            'created_at': {'required': True, 'validators': [validate_created_at]},
            'updated_at': {'required': True, 'validators': [validate_updated_at]},
            'deleted_at': {'required': True, 'validators': [validate_deleted_at]},
            'deleted_by': {'required': True, 'validators': [validate_deleted_by]},
        }
        