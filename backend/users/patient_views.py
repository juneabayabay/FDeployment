from django.db.models import Q
from rest_framework import viewsets

from rest_framework.permissions import IsAuthenticated

from .permissions import HasClinicPermission, IsClinicStaffMember
from .models import Role, User
from .serializers import PublicRegisterSerializer, UserSerializer, UserUpdateSerializer


class PatientViewSet(viewsets.ModelViewSet):
    """Patient registry — users with the ``user`` role."""

    permission_classes = [IsAuthenticated, IsClinicStaffMember, HasClinicPermission]
    permission_map = {
        "list": ["patients.view"],
        "retrieve": ["patients.view"],
        "create": ["patients.create"],
        "update": ["patients.update"],
        "partial_update": ["patients.update"],
        "destroy": ["patients.delete"],
    }

    def get_queryset(self):
        qs = (
            User.objects.filter(
                deleted_at__isnull=True,
                user_roles__role__slug=Role.USER,
            )
            .distinct()
            .select_related("patient_profile")
            .prefetch_related("user_roles__role")
            .order_by("-created_at")
        )
        search = self.request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(email__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(phone__icontains=search)
            )
        return qs

    def get_serializer_class(self):
        if self.action == "create":
            return PublicRegisterSerializer
        if self.action in ("update", "partial_update"):
            return UserUpdateSerializer
        return UserSerializer

    def perform_destroy(self, instance):
        instance.soft_delete()
