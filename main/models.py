from django.db import models
from django.conf import settings


class Project(models.Model):
    project_id = models.CharField(max_length=255)
    project_name = models.CharField(max_length=255)
    project_description = models.TextField()
    project_created_at = models.DateTimeField(auto_now_add=True)
    project_updated_at = models.DateTimeField(auto_now=True)
    project_status = models.CharField(max_length=255)
    project_type = models.CharField(max_length=255)
    project_priority = models.CharField(max_length=255)
    project_assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    project_start_date = models.DateTimeField()
    project_end_date = models.DateTimeField()
    project_budget = models.DecimalField(max_digits=10, decimal_places=2)
    project_progress = models.IntegerField()
    project_completed = models.BooleanField(default=False)
    #project_created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    #project_updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    project_deleted = models.BooleanField(default=False)
    project_deleted_at = models.DateTimeField(null=True, blank=True)
    project_deleted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='project_deleted_by')
    project_deleted_reason = models.TextField(null=True, blank=True)
    project_deleted_comment = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.project_name


class Ticket(models.Model):
    ticket_id = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=255)
    priority = models.CharField(max_length=255)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    ticket_type = models.CharField(max_length=255)
    ticket_status = models.CharField(max_length=255)
    ticket_category = models.CharField(max_length=255)
    ticket_subcategory = models.CharField(max_length=255)
    ticket_severity = models.CharField(max_length=255)
    ticket_source = models.CharField(max_length=255)
    ticket_source_id = models.CharField(max_length=255)
    ticket_source_url = models.URLField()
    ticket_source_type = models.CharField(max_length=255)

    def __str__(self):
        return self.title



        
