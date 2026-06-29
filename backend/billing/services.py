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


def _add_fee_to_appointment_billing(appointment, amount, fee_label):
    """
    Add a fee to the appointment's billing record.
    Each appointment has at most one bill (OneToOne); fees are added to that record.
    """
    amount = Decimal(str(amount))
    if amount <= 0:
        return None

    fee_label_lower = fee_label.lower()
    existing = BillingRecord.objects.filter(appointment=appointment).first()
    if existing:
        if fee_label_lower in (existing.description or "").lower():
            return existing
        note = f"{fee_label} — appointment #{appointment.pk}"
        if existing.description:
            existing.description = f"{existing.description}; {note}"
        else:
            existing.description = note
        existing.total_amount = (existing.total_amount or Decimal("0")) + amount
        existing.save(update_fields=["description", "total_amount", "updated_at"])
        return existing

    return post_appointment_fee(
        patient=appointment.patient,
        appointment=appointment,
        amount=amount,
        description=f"{fee_label} — appointment #{appointment.pk}",
    )


def post_cancellation_fee(appointment):
    fee = appointment.cancellation_fee or Decimal("0")
    return _add_fee_to_appointment_billing(appointment, fee, "Cancellation fee")


def post_no_show_fee(appointment):
    fee = get_no_show_fee()
    return _add_fee_to_appointment_billing(appointment, fee, "No-show fee")
