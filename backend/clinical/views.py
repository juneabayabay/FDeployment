from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from appointments.mixins import StaffPermissionMixin
from appointments.serializers_staff import StaffAppointmentSerializer
from users.models import Role, User

from .models import OrthodonticRecord, PrescriptionRecord, SurgicalRecord, TreatmentRecord
from .serializers import (
    OrthodonticRecordSerializer,
    PrescriptionRecordSerializer,
    SurgicalRecordSerializer,
    TreatmentRecordSerializer,
)
from .services import ScheduleAdjustmentError, schedule_orthodontic_adjustment


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

    @action(detail=True, methods=["post"], url_path="schedule-next")
    def schedule_next(self, request, patient_pk=None, pk=None):
        record = self.get_object()
        patient = _patient_queryset(patient_pk).first()
        if not patient:
            from rest_framework.exceptions import NotFound

            raise NotFound("Patient not found.")
        try:
            appointment = schedule_orthodontic_adjustment(record, patient)
        except ScheduleAdjustmentError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        from appointments.views_staff import _staff_appointment_queryset

        appointment = _staff_appointment_queryset().get(pk=appointment.pk)
        return Response(
            StaffAppointmentSerializer(appointment, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


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


class PatientPrescriptionViewSet(StaffPermissionMixin, viewsets.ModelViewSet):
    serializer_class = PrescriptionRecordSerializer
    staff_permissions = {
        "GET": "treatments.view",
        "POST": "treatments.create",
        "PATCH": "treatments.update",
        "PUT": "treatments.update",
        "DELETE": "treatments.delete",
    }

    def get_queryset(self):
        return PrescriptionRecord.objects.filter(
            patient_id=self.kwargs["patient_pk"]
        ).select_related("prescribed_by")

    def perform_create(self, serializer):
        patient = _patient_queryset(self.kwargs["patient_pk"]).first()
        if not patient:
            from rest_framework.exceptions import NotFound

            raise NotFound("Patient not found.")
        serializer.save(patient=patient, prescribed_by=self.request.user)
