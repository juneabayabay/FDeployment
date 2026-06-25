from django.db.models import Q
from rest_framework import generics

from appointments.mixins import StaffPermissionMixin

from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogListView(StaffPermissionMixin, generics.ListAPIView):
    staff_permissions = {"GET": "audit.view"}
    serializer_class = AuditLogSerializer

    def get_queryset(self):
        qs = AuditLog.objects.select_related("actor").order_by("-created_at")
        module = self.request.query_params.get("module", "").strip()
        if module:
            qs = qs.filter(module=module)
        user_id = self.request.query_params.get("user")
        if user_id:
            qs = qs.filter(actor_id=user_id)
        search = self.request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(summary__icontains=search)
                | Q(resource_type__icontains=search)
                | Q(resource_id__icontains=search)
            )
        from_date = self.request.query_params.get("from")
        if from_date:
            qs = qs.filter(created_at__date__gte=from_date)
        to_date = self.request.query_params.get("to")
        if to_date:
            qs = qs.filter(created_at__date__lte=to_date)
        return qs
