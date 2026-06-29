from datetime import datetime, time, timedelta

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from notifications.services import notify_appointment_cancelled, notify_appointment_confirmed

from users.models import Role, User

from .models import Appointment, Procedure, ProcedurePackage, WaitingListEntry
from .services import (
    SlotUnavailableError,
    assert_slot_available,
    calculate_cancellation_fee,
    generate_time_slots,
    get_slots_meta,
    is_clinic_day,
    is_daily_capacity_full,
    resolve_booking_selection,
)


class ProcedureSerializer(serializers.ModelSerializer):
    duration_hours = serializers.SerializerMethodField()

    class Meta:
        model = Procedure
        fields = [
            "id",
            "name",
            "slug",
            "category",
            "duration_minutes",
            "duration_hours",
            "price",
        ]

    def get_duration_hours(self, obj):
        hours = obj.duration_minutes / 60
        return int(hours) if hours == int(hours) else hours


class ProcedurePackageSerializer(serializers.ModelSerializer):
    procedures = ProcedureSerializer(many=True, read_only=True)
    total_duration_minutes = serializers.SerializerMethodField()

    class Meta:
        model = ProcedurePackage
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "procedures",
            "package_price",
            "total_duration_minutes",
        ]

    def get_total_duration_minutes(self, obj):
        return obj.total_duration_minutes


class AppointmentUserSummarySerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    avatar_url = serializers.SerializerMethodField()
    role_slugs = serializers.ListField(child=serializers.CharField(), read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "avatar_url",
            "role_slugs",
        ]

    def get_avatar_url(self, obj):
        from users.serializers_dentist import resolve_user_avatar_url

        return resolve_user_avatar_url(obj, self.context.get("request"))


def _validate_dentist_user(user_id):
    if user_id is None:
        return None
    try:
        user = User.objects.get(pk=user_id, deleted_at__isnull=True, is_active=True)
    except User.DoesNotExist as exc:
        raise serializers.ValidationError("Dentist not found.") from exc
    if not user.user_roles.filter(role__slug=Role.DENTIST).exists():
        raise serializers.ValidationError("Selected user is not a dentist.")
    return user


class AppointmentSerializer(serializers.ModelSerializer):
    procedures = ProcedureSerializer(many=True, read_only=True)
    procedure_ids = serializers.PrimaryKeyRelatedField(
        queryset=Procedure.objects.filter(is_active=True),
        source="procedures",
        many=True,
        write_only=True,
        required=False,
    )
    dentist = AppointmentUserSummarySerializer(read_only=True)
    is_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "appointment_date",
            "start_time",
            "end_time",
            "status",
            "booking_type",
            "booking_source",
            "procedures",
            "procedure_ids",
            "dentist",
            "total_duration_minutes",
            "total_amount",
            "notes",
            "pencil_expires_at",
            "cancellation_fee",
            "is_active",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "end_time",
            "status",
            "total_duration_minutes",
            "total_amount",
            "pencil_expires_at",
            "cancellation_fee",
            "created_at",
        ]


class AppointmentCreateSerializer(serializers.Serializer):
    appointment_date = serializers.DateField()
    start_time = serializers.TimeField()
    procedure_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=list,
    )
    package_id = serializers.IntegerField(required=False, allow_null=True)
    booking_type = serializers.ChoiceField(
        choices=Appointment.BookingType.choices,
        default=Appointment.BookingType.PENCIL,
    )
    booking_source = serializers.ChoiceField(
        choices=Appointment.BookingSource.choices,
        default=Appointment.BookingSource.ONLINE,
        required=False,
    )
    notes = serializers.CharField(required=False, allow_blank=True, default="")
    dentist_id = serializers.IntegerField(required=False, allow_null=True)

    def validate_dentist_id(self, value):
        return _validate_dentist_user(value)

    def validate(self, attrs):
        package_id = attrs.get("package_id")
        procedure_ids = attrs.get("procedure_ids") or []

        if package_id and procedure_ids:
            raise serializers.ValidationError(
                "Provide either package_id or procedure_ids, not both."
            )
        if not package_id and not procedure_ids:
            raise serializers.ValidationError(
                "Select a package or at least one procedure."
            )

        resolved = resolve_booking_selection(
            procedure_ids=procedure_ids if not package_id else None,
            package_id=package_id,
        )
        if not resolved:
            field = "package_id" if package_id else "procedure_ids"
            raise serializers.ValidationError(
                {field: "One or more items are invalid or inactive."}
            )

        appt_date = attrs["appointment_date"]
        if appt_date < timezone.localdate():
            raise serializers.ValidationError(
                {"appointment_date": "Cannot book a date in the past."}
            )
        if not is_clinic_day(appt_date):
            raise serializers.ValidationError(
                {"appointment_date": "Clinic is open Mon–Sat only."}
            )
        if is_daily_capacity_full(appt_date):
            raise serializers.ValidationError(
                {"appointment_date": "This day is fully booked. Join the waiting list."}
            )

        procedures = resolved["procedures"]
        duration = resolved["duration_minutes"]
        start_time = attrs["start_time"]
        slots = generate_time_slots(appt_date, duration)
        start_str = start_time.strftime("%H:%M") if isinstance(start_time, time) else start_time
        valid_starts = {s["start_time"] for s in slots}
        if start_str not in valid_starts:
            raise serializers.ValidationError(
                {"start_time": "Selected time slot is not available."}
            )

        end_dt = datetime.combine(appt_date, start_time) + timedelta(
            minutes=duration
        )
        attrs["procedures"] = procedures
        attrs["total_duration_minutes"] = duration
        attrs["total_amount"] = resolved["total_amount"]
        attrs["end_time"] = end_dt.time()
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user
        procedures = validated_data.pop("procedures")
        validated_data.pop("procedure_ids", None)
        dentist = validated_data.pop("dentist_id", None)
        booking_type = validated_data.pop("booking_type")
        booking_source = validated_data.pop(
            "booking_source", Appointment.BookingSource.ONLINE
        )
        total_duration = validated_data.pop("total_duration_minutes")
        total_amount = validated_data.pop("total_amount")
        end_time = validated_data.pop("end_time")
        appt_date = validated_data["appointment_date"]
        start_time = validated_data["start_time"]

        try:
            assert_slot_available(appt_date, start_time, end_time)
        except SlotUnavailableError as exc:
            raise serializers.ValidationError({exc.field: exc.message}) from exc

        status = (
            Appointment.Status.CONFIRMED
            if booking_type == Appointment.BookingType.PAID
            else Appointment.Status.PENCIL_BOOKED
        )

        appointment = Appointment.objects.create(
            patient=user,
            dentist=dentist,
            booking_type=booking_type,
            booking_source=booking_source,
            status=status,
            total_duration_minutes=total_duration,
            total_amount=total_amount,
            end_time=end_time,
            **validated_data,
        )
        appointment.procedures.set(procedures)

        if status == Appointment.Status.PENCIL_BOOKED:
            appointment.set_pencil_expiry()
            appointment.save(update_fields=["pencil_expires_at"])

        if status == Appointment.Status.CONFIRMED:
            notify_appointment_confirmed(appointment)

        from billing.models import BillingRecord

        BillingRecord.objects.create(
            patient=user,
            appointment=appointment,
            total_amount=total_amount,
            amount_paid=total_amount if booking_type == Appointment.BookingType.PAID else 0,
        )

        return appointment


class AppointmentRescheduleSerializer(serializers.Serializer):
    appointment_date = serializers.DateField()
    start_time = serializers.TimeField()

    def validate(self, attrs):
        appointment = self.context["appointment"]
        appt_date = attrs["appointment_date"]
        if appt_date < timezone.localdate():
            raise serializers.ValidationError(
                {"appointment_date": "Cannot reschedule to a past date."}
            )
        if not is_clinic_day(appt_date):
            raise serializers.ValidationError(
                {"appointment_date": "Clinic is open Mon–Sat only."}
            )

        duration = appointment.total_duration_minutes
        slots = generate_time_slots(appt_date, duration)
        start_time = attrs["start_time"]
        start_str = start_time.strftime("%H:%M")
        if start_str not in {s["start_time"] for s in slots}:
            raise serializers.ValidationError(
                {"start_time": "Selected time slot is not available."}
            )

        end_dt = datetime.combine(appt_date, start_time) + timedelta(
            minutes=duration
        )
        attrs["end_time"] = end_dt.time()
        return attrs

    @transaction.atomic
    def save_reschedule(self, appointment):
        appt_date = self.validated_data["appointment_date"]
        start_time = self.validated_data["start_time"]
        end_time = self.validated_data["end_time"]

        try:
            assert_slot_available(
                appt_date,
                start_time,
                end_time,
                exclude_appointment_id=appointment.pk,
            )
        except SlotUnavailableError as exc:
            raise serializers.ValidationError({exc.field: exc.message}) from exc

        appointment.appointment_date = appt_date
        appointment.start_time = start_time
        appointment.end_time = end_time
        appointment.save(
            update_fields=[
                "appointment_date",
                "start_time",
                "end_time",
                "updated_at",
            ]
        )
        return appointment


class WaitingListSerializer(serializers.ModelSerializer):
    procedures = ProcedureSerializer(many=True, read_only=True)
    procedure_ids = serializers.PrimaryKeyRelatedField(
        queryset=Procedure.objects.filter(is_active=True),
        source="procedures",
        many=True,
        write_only=True,
        required=False,
    )
    is_suggested = serializers.SerializerMethodField()

    class Meta:
        model = WaitingListEntry
        fields = [
            "id",
            "preferred_date",
            "procedures",
            "procedure_ids",
            "notes",
            "is_active",
            "suggested_for_date",
            "is_suggested",
            "created_at",
        ]
        read_only_fields = ["id", "is_active", "suggested_for_date", "is_suggested", "created_at"]

    def get_is_suggested(self, obj):
        return obj.suggested_for_date is not None


class AvailableSlotsSerializer(serializers.Serializer):
    date = serializers.DateField()
    duration_minutes = serializers.IntegerField(min_value=1, default=60)

    def validate_date(self, value):
        if value < timezone.localdate():
            raise serializers.ValidationError("Cannot view past dates.")
        if not is_clinic_day(value):
            raise serializers.ValidationError("Clinic is open Mon–Sat only.")
        return value
