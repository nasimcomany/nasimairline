"""
App configuration for support app
"""
from django.apps import AppConfig


class SupportConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'support'
    verbose_name = 'پشتیبانی و تیکتینگ'
    
    def ready(self):
        """Import signals when app is ready"""
        import support.signals
