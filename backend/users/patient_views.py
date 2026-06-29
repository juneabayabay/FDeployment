from django.db.models import Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .permissions import HasClinicPermission, IsClinicStaffMember
from .models import Role, User
from .serializers import (
    PublicRegisterSerializer,
    UserSerializer,
    UserUpdateSerializer,
    WalkInPatientCreateSerializer,
)


class PatientViewSet(viewsets.ModelViewSet):
    """Patient registry — users with the ``user`` role."""

    permission_classes = [IsAuthenticated, IsClinicStaffMember, HasClinicPermission]
    permission_map = {
        "list": ["patients.view"],
        "retrieve": ["patients.view"],
        "create": ["patients.create"],
        "walk_in": ["patients.create"],
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
        if self.action == "walk_in":
            return WalkInPatientCreateSerializer
        if self.action in ("update", "partial_update"):
            return UserUpdateSerializer
        return UserSerializer

    def perform_destroy(self, instance):
        instance.soft_delete()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        if not user.email_verified_at:
            user.email_verified_at = timezone.now()
            user.save(update_fields=["email_verified_at", "updated_at"])
        user = self.get_queryset().get(pk=user.pk)
        return Response(
            UserSerializer(user, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        instance = self.get_queryset().get(pk=instance.pk)
        return Response(
            UserSerializer(instance, context={"request": request}).data,
        )

    @action(detail=False, methods=["post"], url_path="walk-in")
    def walk_in(self, request):
        serializer = WalkInPatientCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user = self.get_queryset().get(pk=user.pk)
        return Response(
            UserSerializer(user, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )
