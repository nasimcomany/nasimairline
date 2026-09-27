"""Helpers for merging notification recipient email lists."""
from django.conf import settings


def always_notify_emails():
    """Emails that must receive every form/chat/ticket notification."""
    return [
        e.strip()
        for e in getattr(settings, 'ALWAYS_NOTIFY_EMAILS', [])
        if e and str(e).strip()
    ]


def merge_notification_emails(*parts):
    """
    Flatten email lists/strings and always append ALWAYS_NOTIFY_EMAILS.
    Dedupes case-insensitively while preserving first-seen casing.
    """
    seen = set()
    out = []

    def _add(item):
        if not item:
            return
        if isinstance(item, (list, tuple, set)):
            for x in item:
                _add(x)
            return
        email = str(item).strip()
        if not email:
            return
        key = email.lower()
        if key in seen:
            return
        seen.add(key)
        out.append(email)

    for part in parts:
        _add(part)
    for email in always_notify_emails():
        _add(email)
    return out
