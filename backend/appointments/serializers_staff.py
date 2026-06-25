from rest_framework import serializers

from notifications.services import notify_appointment_confirmed

from users.models import User

from .models import Appointment, WaitingListEntry
from .serializers import (
    AppointmentCreateSerializer,
    AppointmentSerializer,
    ProcedureSerializer,
    WaitingListSerializer,
)


class PatientSummarySerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    role_slugs = serializers.ListField(read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "full_name", "phone", "role_slugs"]


class StaffAppointmentSerializer(AppointmentSerializer):
    patient = PatientSummarySerializer(read_only=True)

    class Meta(AppointmentSerializer.Meta):
        fields = [
            *AppointmentSerializer.Meta.fields,
            "patient",
        ]
        read_only_fields = [
            *AppointmentSerializer.Meta.read_only_fields,
            "patient",
        ]


class StaffAppointmentCreateSerializer(AppointmentCreateSerializer):
    patient_id = serializers.IntegerField()

    def validate_patient_id(self, value):
        try:
            user = User.objects.get(pk=value, deleted_at__isnull=True, is_active=True)
        except User.DoesNotExist as exc:
            raise serializers.ValidationError("Patient not found.") from exc
        if not user.is_patient_user:
            raise serializers.ValidationError("Selected user is not a patient account.")
        return value

    def create(self, validated_data):
        patient_id = validated_data.pop("patient_id")
        patient = User.objects.get(pk=patient_id)
        request = self.context["request"]
        original_user = request.user
        try:
            request.user = patient
            return super().create(validated_data)
        finally:
            request.user = original_user


class StaffAppointmentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ["status", "notes"]

    def validate_status(self, value):
        allowed = {choice[0] for choice in Appointment.Status.choices}
        if value not in allowed:
            raise serializers.ValidationError("Invalid status.")
        return value

    def update(self, instance, validated_data):
        old_status = instance.status
        instance = super().update(instance, validated_data)
        if (
            old_status != instance.status
            and instance.status == Appointment.Status.CONFIRMED
        ):
            notify_appointment_confirmed(instance)
        if (
            old_status != instance.status
            and instance.status == Appointment.Status.NO_SHOW
        ):
            from billing.services import post_no_show_fee

            post_no_show_fee(instance)
        return instance


class StaffWaitingListSerializer(WaitingListSerializer):
    patient = PatientSummarySerializer(read_only=True)

    class Meta(WaitingListSerializer.Meta):
        fields = WaitingListSerializer.Meta.fields + ["patient"]
        read_only_fields = WaitingListSerializer.Meta.read_only_fields + ["patient"]
