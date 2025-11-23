"""
Views for serving React frontend
"""
from django.views.generic import TemplateView
from django.conf import settings
from django.http import HttpResponse
import os


class ReactAppView(TemplateView):
    """
    Serve React app - handles all routes and serves index.html for SPA
    """
    template_name = 'index.html'
    
    def get(self, request, *args, **kwargs):
        # Check if index.html exists
        index_path = os.path.join(settings.STATIC_ROOT, 'index.html')
        if not os.path.exists(index_path):
            index_path = os.path.join(settings.BASE_DIR, 'frontend', 'build', 'index.html')
        
        if os.path.exists(index_path):
            with open(index_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return HttpResponse(content, content_type='text/html')
        
        # Fallback message if build not found
        return HttpResponse(
            '<h1>Frontend not built yet</h1>'
            '<p>Please run: <code>cd frontend && npm run build</code></p>',
            content_type='text/html'
        )

