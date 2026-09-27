"""
Permissions for limited-admin content editors (SEO / magazine staff).

Staff users who are NOT superusers need explicit Django model permissions
to add/change/delete Category, Article, etc. This module creates a group
and attaches it whenever a limited-admin account is saved.

The accounts app (users, wallets, membership) is fully excluded —
only full /admin/ may manage those.
"""
from django.contrib.auth.models import Group, Permission

LIMITED_EDITOR_GROUP = "limited_content_editor"

# App labels visible on /limited-admin/ (no accounts)
LIMITED_APP_LABELS = ("blog", "gallery", "support", "sms")


def ensure_limited_editor_group() -> Group:
    """Create/update the content-editor group with CRUD on limited-admin apps."""
    group, _ = Group.objects.get_or_create(name=LIMITED_EDITOR_GROUP)
    perms = Permission.objects.filter(content_type__app_label__in=LIMITED_APP_LABELS)
    group.permissions.set(perms)
    return group


def grant_limited_editor_access(user) -> None:
    """
    Give a staff (non-superuser) editor the limited content group.
    Superusers already bypass permission checks.
    """
    if not user or not getattr(user, "pk", None):
        return
    if not user.is_active or not user.is_staff:
        return
    if user.is_superuser:
        return
    group = ensure_limited_editor_group()
    user.groups.add(group)


def sync_all_limited_staff() -> int:
    """Attach the editor group to every current staff non-superuser. Returns count."""
    from django.contrib.auth import get_user_model

    User = get_user_model()
    group = ensure_limited_editor_group()
    qs = User.objects.filter(is_staff=True, is_superuser=False, is_active=True)
    count = 0
    for user in qs:
        user.groups.add(group)
        count += 1
    return count
