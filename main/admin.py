from django.contrib import admin
from main.models import Project, Ticket
from main.serializers import ProjectSerializer, TicketSerializer
from rest_framework import serializers

class ProjectAdmin(admin.ModelAdmin):
    list_display = ['project_id', 'project_name', 'project_description', 'project_created_at', 'project_updated_at', 'project_status', 'project_type', 'project_priority', 'project_assigned_to', 'project_start_date', 'project_end_date', 'project_budget', 'project_progress', 'project_completed', 'project_deleted', 'project_deleted_at', 'project_deleted_by', 'project_deleted_reason', 'project_deleted_comment']
    list_filter = ['project_status', 'project_type', 'project_priority', 'project_assigned_to', 'project_start_date', 'project_end_date', 'project_budget', 'project_progress', 'project_completed', 'project_deleted', 'project_deleted_at', 'project_deleted_by', 'project_deleted_reason', 'project_deleted_comment']
    search_fields = ['project_id', 'project_name', 'project_description', 'project_assigned_to__username']
    list_per_page = 10
    list_max_show_all = 100
    list_editable = ['project_status', 'project_type', 'project_priority', 'project_assigned_to', 'project_start_date', 'project_end_date', 'project_budget', 'project_progress', 'project_completed', 'project_deleted', 'project_deleted_at', 'project_deleted_by', 'project_deleted_reason', 'project_deleted_comment']
    list_display_links = ['project_id', 'project_name']


class TicketAdmin(admin.ModelAdmin):
    list_display = ['ticket_id', 'title', 'description', 'created_at', 'updated_at', 'status', 'priority', 'assigned_to', 'project', 'ticket_type', 'ticket_status', 'ticket_category', 'ticket_subcategory', 'ticket_severity', 'ticket_source', 'ticket_source_id', 'ticket_source_url', 'ticket_source_type']
    list_filter = ['status', 'priority', 'assigned_to', 'project', 'ticket_type', 'ticket_status', 'ticket_category', 'ticket_subcategory', 'ticket_severity', 'ticket_source', 'ticket_source_id', 'ticket_source_url', 'ticket_source_type']
    search_fields = ['ticket_id', 'title', 'description', 'assigned_to__username', 'project__project_name']
    list_per_page = 10
    list_max_show_all = 100
    list_editable = ['status', 'priority', 'assigned_to', 'project', 'ticket_type', 'ticket_status', 'ticket_category', 'ticket_subcategory', 'ticket_severity', 'ticket_source', 'ticket_source_id', 'ticket_source_url', 'ticket_source_type']
    list_display_links = ['ticket_id', 'title']



admin.site.register(Project, ProjectAdmin)
admin.site.register(Ticket, TicketAdmin)   

# Register your models here.
