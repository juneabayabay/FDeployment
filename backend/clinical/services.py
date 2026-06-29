from datetime import datetime, time, timedelta

from django.db import transaction

from appointments.models import Appointment, Procedure
from appointments.services import SlotUnavailableError, assert_slot_available, get_next_available_slot

from .models import OrthodonticRecord


class ScheduleAdjustmentError(Exception):
    pass


def _parse_slot_time(value: str) -> time:
    hour, minute = value.split(":")
    return time(int(hour), int(minute))


def schedule_orthodontic_adjustment(record: OrthodonticRecord, patient):
    if not record.next_adjustment_date:
        raise ScheduleAdjustmentError("Set a next adjustment date on this record first.")

    procedure = Procedure.objects.filter(slug="braces-orthodontics", is_active=True).first()
    if not procedure:
        procedure = Procedure.objects.filter(category="orthodontic", is_active=True).first()
    if not procedure:
        raise ScheduleAdjustmentError("No active orthodontic procedure is configured.")

    slot = get_next_available_slot(record.next_adjustment_date, procedure.duration_minutes)
    if not slot or not slot.get("start_time"):
        raise ScheduleAdjustmentError("No available slot on the next adjustment date.")

    start_time = _parse_slot_time(slot["start_time"])
    end_time = _parse_slot_time(slot["end_time"])

    with transaction.atomic():
        try:
            assert_slot_available(record.next_adjustment_date, start_time, end_time)
        except SlotUnavailableError as exc:
            raise ScheduleAdjustmentError(exc.message) from exc

        appointment = Appointment.objects.create(
            patient=patient,
            appointment_date=record.next_adjustment_date,
            start_time=start_time,
            end_time=end_time,
            status=Appointment.Status.PENDING,
            booking_type=Appointment.BookingType.PENCIL,
            booking_source=Appointment.BookingSource.ONLINE,
            total_duration_minutes=procedure.duration_minutes,
            total_amount=procedure.price,
            notes=f"Orthodontic adjustment — {record.phase or 'adjustment'}".strip(),
        )
        appointment.procedures.add(procedure)

        from billing.models import BillingRecord

        BillingRecord.objects.create(
            patient=patient,
            appointment=appointment,
            total_amount=procedure.price,
            amount_paid=0,
        )

        if record.adjustment_interval_weeks:
            record.next_adjustment_date = record.next_adjustment_date + timedelta(
                weeks=record.adjustment_interval_weeks
            )
            record.save(update_fields=["next_adjustment_date", "updated_at"])

    return appointment
