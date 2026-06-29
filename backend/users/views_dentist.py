from rest_framework import generics, status, viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .dentist_directory import set_clinic_dentist
from .models import DentistProfile, Role
from .permissions import HasClinicPermission
from .serializers_dentist import (
    DentistProfileAdminSerializer,
    DentistProfileSerializer,
    DentistProfileWriteSerializer,
)


def _dentist_profile_queryset():
    return DentistProfile.objects.select_related("user").filter(
        user__deleted_at__isnull=True,
        user__is_active=True,
        user__user_roles__role__slug=Role.DENTIST,
    ).distinct()


class DentistDirectoryView(generics.ListAPIView):
    """Patient- and staff-facing dentist directory."""

    serializer_class = DentistProfileSerializer
    permission_classes = [IsAuthenticated, HasClinicPermission]
    required_permissions = ["dentists.view"]

    def get_queryset(self):
        qs = _dentist_profile_queryset().order_by("user__last_name", "user__first_name")
        user = self.request.user
        if user.is_patient_user and not user.is_clinic_staff and not user.is_superuser:
            qs = qs.filter(is_visible=True)
        return qs


class DentistDirectoryDetailView(generics.RetrieveAPIView):
    serializer_class = DentistProfileSerializer
    permission_classes = [IsAuthenticated, HasClinicPermission]
    required_permissions = ["dentists.view"]

    def get_queryset(self):
        qs = _dentist_profile_queryset()
        user = self.request.user
        if user.is_patient_user and not user.is_clinic_staff and not user.is_superuser:
            qs = qs.filter(is_visible=True)
        return qs


class CurrentDentistProfileView(APIView):
    """Dentist self-service profile (read/update own directory entry)."""

    permission_classes = [IsAuthenticated]

    def _get_profile(self, user):
        if not user.user_roles.filter(role__slug=Role.DENTIST).exists():
            raise PermissionDenied("Dentist access required.")
        profile, _ = DentistProfile.objects.get_or_create(user=user)
        return profile

    def get(self, request):
        profile = self._get_profile(request.user)
        return Response(
            DentistProfileSerializer(profile, context={"request": request}).data
        )

    def patch(self, request):
        profile = self._get_profile(request.user)
        serializer = DentistProfileWriteSerializer(
            profile,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            DentistProfileSerializer(profile, context={"request": request}).data
        )


class DentistProfileViewSet(viewsets.ModelViewSet):
    """Admin/staff management of dentist directory profiles."""

    permission_classes = [HasClinicPermission]
    permission_map = {
        "list": ["dentists.view"],
        "retrieve": ["dentists.view"],
        "create": ["dentists.manage"],
        "update": ["dentists.manage"],
        "partial_update": ["dentists.manage"],
        "destroy": ["dentists.manage"],
    }

    def get_queryset(self):
        return _dentist_profile_queryset().order_by("user__last_name", "user__first_name")

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return DentistProfileAdminSerializer
        return DentistProfileSerializer

    def perform_create(self, serializer):
        user = serializer.validated_data["user"]
        if DentistProfile.objects.filter(user=user).exists():
            raise ValidationError({"user_id": "This dentist already has a profile."})
        profile = serializer.save()
        set_clinic_dentist(profile)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        profile = serializer.instance
        return Response(
            DentistProfileSerializer(profile, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            DentistProfileSerializer(instance, context={"request": request}).data
        )

    def destroy(self, request, *args, **kwargs):
        return Response(
            {"detail": "Delete dentist profiles via user deactivation instead."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )
