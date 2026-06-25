from rest_framework.permissions import BasePermission

from .models import Role


class IsPatientUser(BasePermission):
    message = "Patient access required."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.is_patient_user


class IsClinicStaffMember(BasePermission):
    message = "Staff access required."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.is_superuser or user.is_clinic_staff


class IsAdminRole(BasePermission):
    message = "Admin access required."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        return user.user_roles.filter(role__slug=Role.ADMIN).exists()


class HasClinicPermission(BasePermission):
    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        codenames = getattr(view, "required_permissions", None)
        if codenames is None:
            codenames = getattr(view, "permission_map", {}).get(
                getattr(view, "action", None), []
            )

        if not codenames:
            return False

        if user.is_superuser:
            return True

        if isinstance(codenames, str):
            codenames = [codenames]

        return any(user.has_clinic_permission(codename) for codename in codenames)


def permission_required(*codenames):
    class _Permission(HasClinicPermission):
        def has_permission(self, request, view):
            view.required_permissions = codenames
            return super().has_permission(request, view)

    return _Permission
