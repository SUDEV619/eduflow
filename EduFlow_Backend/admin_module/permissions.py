from rest_framework.permissions import BasePermission


class IsAdminUserRole(BasePermission):
    """
    Grants access only to authenticated users whose role is 'ADMIN'.
    Returns a clear 403 message for non-admins.
    """
    message = {"status": "error", "message": "Unauthorized access. Admin role required."}

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'ADMIN'
        )
