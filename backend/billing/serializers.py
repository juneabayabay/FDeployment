from rest_framework import serializers

from .models import BillingRecord


class BillingRecordSerializer(serializers.ModelSerializer):
    balance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    appointment_date = serializers.DateField(
        source="appointment.appointment_date",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = BillingRecord
        fields = [
            "id",
            "description",
            "total_amount",
            "amount_paid",
            "balance",
            "payment_method",
            "payment_status",
            "appointment",
            "appointment_date",
            "created_at",
        ]
