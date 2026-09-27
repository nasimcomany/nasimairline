"""
Celery application for Nasim Air.

Queues (separate workers in production):
  - web path stays fast; slow I/O goes here
  - nira:    Nira / flight enrichment background jobs
  - notify:  email, telegram, whatsapp
  - sms:     Mellipayamak SMS
  - default: everything else
  - critical: booking/payment confirmations (highest priority)
"""
import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nasim.settings')

app = Celery('nasim')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Soft defaults; overridden by settings / env
app.conf.task_default_queue = 'default'
app.conf.task_queues = None  # declared in settings via task_routes


@app.task(bind=True, ignore_result=True)
def debug_ping(self):
    return {'ok': True, 'worker': self.request.hostname}
