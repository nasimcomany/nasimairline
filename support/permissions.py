"""
Custom permissions for support app
"""
from rest_framework import permissions


class IsTicketOwnerOrStaff(permissions.BasePermission):
    """
    Permission to allow ticket owner or staff to access
    """
    def has_object_permission(self, request, view, obj):
        # Staff can access all tickets
        if request.user.is_staff:
            return True
        
        # Users can only access their own tickets
        return obj.user == request.user


class IsStaffOrReadOnly(permissions.BasePermission):
    """
    Permission to allow staff to modify, others can only read
    """
    def has_permission(self, request, view):
        # Read permissions for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Write permissions only for staff
        return request.user.is_staff

