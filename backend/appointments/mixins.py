from rest_framework.permissions import IsAuthenticated

from users.permissions import HasClinicPermission, IsClinicStaffMember


class StaffPermissionMixin:
    """Clinic staff only, with permission codenames from ``staff_permissions``."""

    permission_classes = [IsAuthenticated, IsClinicStaffMember, HasClinicPermission]
    staff_permissions = {}

    def initial(self, request, *args, **kwargs):
        perms = self.staff_permissions.get(
            request.method,
            self.staff_permissions.get("default"),
        )
        if perms:
            self.required_permissions = perms if isinstance(perms, list) else [perms]
        super().initial(request, *args, **kwargs)
