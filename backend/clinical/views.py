from rest_framework import generics, viewsets

from appointments.mixins import StaffPermissionMixin
from users.models import Role, User

from .models import OrthodonticRecord, SurgicalRecord, TreatmentRecord
from .serializers import (
    OrthodonticRecordSerializer,
    SurgicalRecordSerializer,
    TreatmentRecordSerializer,
)


def _patient_queryset(patient_id):
    return User.objects.filter(
        pk=patient_id,
        deleted_at__isnull=True,
        user_roles__role__slug=Role.USER,
    ).distinct()


class PatientTreatmentViewSet(StaffPermissionMixin, viewsets.ModelViewSet):
    serializer_class = TreatmentRecordSerializer
    staff_permissions = {
        "GET": "treatments.view",
        "POST": "treatments.create",
        "PATCH": "treatments.update",
        "PUT": "treatments.update",
        "DELETE": "treatments.delete",
    }

    def get_queryset(self):
        return TreatmentRecord.objects.filter(patient_id=self.kwargs["patient_pk"])

    def perform_create(self, serializer):
        patient = _patient_queryset(self.kwargs["patient_pk"]).first()
        if not patient:
            from rest_framework.exceptions import NotFound

            raise NotFound("Patient not found.")
        serializer.save(patient=patient, created_by=self.request.user)


class PatientOrthodonticViewSet(StaffPermissionMixin, viewsets.ModelViewSet):
    serializer_class = OrthodonticRecordSerializer
    staff_permissions = {
        "GET": "treatments.view",
        "POST": "treatments.create",
        "PATCH": "treatments.update",
        "PUT": "treatments.update",
        "DELETE": "treatments.delete",
    }

    def get_queryset(self):
        return OrthodonticRecord.objects.filter(patient_id=self.kwargs["patient_pk"])

    def perform_create(self, serializer):
        patient = _patient_queryset(self.kwargs["patient_pk"]).first()
        if not patient:
            from rest_framework.exceptions import NotFound

            raise NotFound("Patient not found.")
        serializer.save(patient=patient, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class PatientSurgicalViewSet(StaffPermissionMixin, viewsets.ModelViewSet):
    serializer_class = SurgicalRecordSerializer
    staff_permissions = {
        "GET": "treatments.view",
        "POST": "treatments.create",
        "PATCH": "treatments.update",
        "PUT": "treatments.update",
        "DELETE": "treatments.delete",
    }

    def get_queryset(self):
        return SurgicalRecord.objects.filter(patient_id=self.kwargs["patient_pk"])

    def perform_create(self, serializer):
        patient = _patient_queryset(self.kwargs["patient_pk"]).first()
        if not patient:
            from rest_framework.exceptions import NotFound

            raise NotFound("Patient not found.")
        serializer.save(patient=patient, created_by=self.request.user)
