from decimal import Decimal

from rest_framework import serializers

from users.models import User

from .models import BillingRecord
from .serializers import BillingRecordSerializer

BRACES_KEYWORDS = ("braces", "orthodontic", "down payment", "down-payment")


class PatientSummarySerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "full_name", "phone"]


class StaffBillingRecordSerializer(BillingRecordSerializer):
    patient = PatientSummarySerializer(read_only=True)
    balance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta(BillingRecordSerializer.Meta):
        fields = BillingRecordSerializer.Meta.fields + ["patient"]
        read_only_fields = ["payment_status", "created_at"]


class StaffBillingAmountMixin:
    def validate_total_amount(self, value):
        if value < Decimal("0"):
            raise serializers.ValidationError("Total amount cannot be negative.")
        return value

    def validate_amount_paid(self, value):
        if value < Decimal("0"):
            raise serializers.ValidationError("Amount paid cannot be negative.")
        return value

    def validate_billing_amounts(self, attrs, instance=None):
        total = attrs.get(
            "total_amount",
            instance.total_amount if instance else Decimal("0"),
        )
        paid = attrs.get(
            "amount_paid",
            instance.amount_paid if instance else Decimal("0"),
        )
        if paid > total:
            raise serializers.ValidationError(
                {"amount_paid": "Amount paid cannot exceed total amount."}
            )
        return attrs


class StaffBillingRecordCreateSerializer(StaffBillingAmountMixin, serializers.ModelSerializer):
    patient_id = serializers.IntegerField()
    appointment_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = BillingRecord
        fields = [
            "patient_id",
            "appointment_id",
            "description",
            "total_amount",
            "amount_paid",
            "payment_method",
        ]

    def validate_patient_id(self, value):
        try:
            user = User.objects.get(pk=value, deleted_at__isnull=True, is_active=True)
        except User.DoesNotExist as exc:
            raise serializers.ValidationError("Patient not found.") from exc
        if not user.is_patient_user:
            raise serializers.ValidationError("Selected user is not a patient account.")
        return value

    def validate(self, attrs):
        desc = (attrs.get("description") or "").lower()
        if any(keyword in desc for keyword in BRACES_KEYWORDS):
            raise serializers.ValidationError(
                {
                    "description": (
                        "Braces and down payments must use the approval workflow."
                    )
                }
            )

        appointment_id = attrs.get("appointment_id")
        if appointment_id:
            from appointments.models import Appointment

            patient_id = attrs["patient_id"]
            if not Appointment.objects.filter(
                pk=appointment_id,
                patient_id=patient_id,
            ).exists():
                raise serializers.ValidationError(
                    {"appointment_id": "Appointment not found for this patient."}
                )

        return self.validate_billing_amounts(attrs)

    def create(self, validated_data):
        patient_id = validated_data.pop("patient_id")
        appointment_id = validated_data.pop("appointment_id", None)
        return BillingRecord.objects.create(
            patient_id=patient_id,
            appointment_id=appointment_id,
            **validated_data,
        )


class StaffBillingRecordUpdateSerializer(StaffBillingAmountMixin, serializers.ModelSerializer):
    class Meta:
        model = BillingRecord
        fields = ["description", "total_amount", "amount_paid", "payment_method", "payment_status"]

    def validate_payment_method(self, value):
        if value == "":
            return value
        allowed = {choice[0] for choice in BillingRecord.PaymentMethod.choices}
        if value not in allowed:
            raise serializers.ValidationError("Invalid payment method.")
        return value

    def validate_payment_status(self, value):
        allowed = {choice[0] for choice in BillingRecord.PaymentStatus.choices}
        if value not in allowed:
            raise serializers.ValidationError("Invalid payment status.")
        return value

    def validate(self, attrs):
        return self.validate_billing_amounts(attrs, instance=self.instance)
