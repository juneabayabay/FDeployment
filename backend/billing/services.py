from decimal import Decimal

from appointments.clinic_config import get_no_show_fee

from .models import BillingRecord


def post_appointment_fee(*, patient, appointment, amount, description, payment_method=None):
    """Create a billing line for cancellation or no-show fees."""
    amount = Decimal(str(amount))
    if amount <= 0:
        return None
    return BillingRecord.objects.create(
        patient=patient,
        appointment=appointment,
        description=description,
        total_amount=amount,
        amount_paid=Decimal("0"),
        payment_method=payment_method or "",
    )


def post_cancellation_fee(appointment):
    fee = appointment.cancellation_fee or Decimal("0")
    if fee <= 0:
        return None
    existing = BillingRecord.objects.filter(
        appointment=appointment,
        description__icontains="Cancellation fee",
    ).exists()
    if existing:
        return None
    return post_appointment_fee(
        patient=appointment.patient,
        appointment=appointment,
        amount=fee,
        description=f"Cancellation fee — appointment #{appointment.pk}",
    )


def post_no_show_fee(appointment):
    fee = get_no_show_fee()
    existing = BillingRecord.objects.filter(
        appointment=appointment,
        description__icontains="No-show fee",
    ).exists()
    if existing:
        return None
    return post_appointment_fee(
        patient=appointment.patient,
        appointment=appointment,
        amount=fee,
        description=f"No-show fee — appointment #{appointment.pk}",
    )
