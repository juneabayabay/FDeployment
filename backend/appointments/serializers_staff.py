from rest_framework import serializers

from notifications.services import notify_appointment_confirmed

from users.models import Role, User

from .models import Appointment, WaitingListEntry
from .serializers import (
    AppointmentCreateSerializer,
    AppointmentSerializer,
    AppointmentUserSummarySerializer,
    ProcedureSerializer,
    WaitingListSerializer,
    _validate_dentist_user,
)
from .services import COMPLETABLE_STATUSES, can_complete_appointment


class PatientSummarySerializer(AppointmentUserSummarySerializer):
    class Meta(AppointmentUserSummarySerializer.Meta):
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone",
            "avatar_url",
            "role_slugs",
        ]


class StaffAppointmentSerializer(AppointmentSerializer):
    patient = PatientSummarySerializer(read_only=True)
    can_complete = serializers.SerializerMethodField()

    class Meta(AppointmentSerializer.Meta):
        fields = [
            *AppointmentSerializer.Meta.fields,
            "patient",
            "can_complete",
        ]
        read_only_fields = [
            *AppointmentSerializer.Meta.read_only_fields,
            "patient",
            "can_complete",
        ]

    def get_can_complete(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        is_admin = (
            user
            and user.is_authenticated
            and (
                user.is_superuser
                or user.user_roles.filter(role__slug=Role.ADMIN).exists()
            )
        )
        if is_admin:
            return obj.status in COMPLETABLE_STATUSES
        return can_complete_appointment(obj)


class StaffAppointmentCreateSerializer(AppointmentCreateSerializer):
    patient_id = serializers.IntegerField()
    dentist_id = serializers.IntegerField(required=False, allow_null=True)

    def validate_dentist_id(self, value):
        return _validate_dentist_user(value)

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
    dentist_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Appointment
        fields = ["status", "notes", "dentist_id"]

    def validate_dentist_id(self, value):
        return _validate_dentist_user(value)

    def validate_status(self, value):
        allowed = {choice[0] for choice in Appointment.Status.choices}
        if value not in allowed:
            raise serializers.ValidationError("Invalid status.")
        if value == Appointment.Status.COMPLETED:
            request = self.context.get("request")
            user = getattr(request, "user", None)
            is_admin = (
                user
                and user.is_authenticated
                and (
                    user.is_superuser
                    or user.user_roles.filter(role__slug=Role.ADMIN).exists()
                )
            )
            if not is_admin and not can_complete_appointment(self.instance):
                raise serializers.ValidationError(
                    "Appointment can only be marked complete during the scheduled time."
                )
        return value

    def update(self, instance, validated_data):
        if "dentist_id" in validated_data:
            instance.dentist = validated_data.pop("dentist_id")
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
