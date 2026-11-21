"""Helpers for merging notification recipient email lists."""
from django.conf import settings

# رونوشت ثابت همه اعلان‌های فرم، چت و تیکت
OWNER_NOTIFY_EMAIL = 'grifindorekamyar@gmail.com'


def always_notify_emails():
    """Emails that must receive every form/chat/ticket notification."""
    return [
        e.strip()
        for e in getattr(settings, 'ALWAYS_NOTIFY_EMAILS', [])
        if e and str(e).strip()
    ]


def merge_notification_emails(*parts, exclude=None):
    """
    Flatten email lists/strings and always append ALWAYS_NOTIFY_EMAILS.
    Dedupes case-insensitively while preserving first-seen casing.
    exclude drops matching addresses from both the given lists and ALWAYS_NOTIFY.
    """
    excluded = {
        str(item).strip().lower()
        for item in (exclude or [])
        if item and str(item).strip()
    }
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
        if key in seen or key in excluded:
            return
        seen.add(key)
        out.append(email)

    for part in parts:
        _add(part)
    for email in always_notify_emails():
        _add(email)
    _add(OWNER_NOTIFY_EMAIL)
    return out


def drop_notification_emails(emails, *blocked):
    """Remove blocked addresses from a recipient list. Case-insensitive."""
    blocked_keys = {
        str(item).strip().lower()
        for item in blocked
        if item and str(item).strip()
    }
    seen = set()
    out = []
    for item in emails or []:
        email = str(item).strip()
        if not email:
            continue
        key = email.lower()
        if key in blocked_keys or key in seen:
            continue
        seen.add(key)
        out.append(email)
    return out


def form_recipients(emails, *extra, exclude=None):
    """
    Recipient list for a single form.
    Adds extra addresses and the fixed owner copy, then drops excluded inboxes.
    """
    merged = []
    for item in (emails, extra, [OWNER_NOTIFY_EMAIL]):
        if isinstance(item, (list, tuple, set)):
            merged.extend(item)
        elif item:
            merged.append(item)
    return drop_notification_emails(merged, *(exclude or []))
