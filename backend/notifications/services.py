import logging

from users.email_utils import send_clinic_email

from .email_templates import (
    build_appointment_cancelled_email,
    build_appointment_confirmed_email,
    build_appointment_reminder_email,
    build_follow_up_reminder_email,
    build_waiting_list_slot_email,
)
from .models import Notification

logger = logging.getLogger(__name__)


def create_notification(user, notification_type, title, message, appointment=None):
    return Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        appointment=appointment,
    )


def _try_send_email(recipient, subject, text_body):
    if not recipient:
        return
    sent, error = send_clinic_email(
        subject=subject,
        text_body=text_body,
        recipient=recipient,
    )
    if not sent:
        logger.warning("Email not sent to %s: %s", recipient, error)


def _matching_waiting_list_entries(appointment_date, procedure_ids=None):
    from appointments.models import WaitingListEntry

    procedure_ids = set(procedure_ids or [])
    entries = []

    for entry in WaitingListEntry.objects.filter(is_active=True).prefetch_related(
        "procedures"
    ):
        if entry.preferred_date and entry.preferred_date != appointment_date:
            continue
        if procedure_ids:
            entry_ids = set(entry.procedures.values_list("id", flat=True))
            if entry_ids and not entry_ids.intersection(procedure_ids):
                continue
        entries.append(entry)

    return sorted(
        entries,
        key=lambda e: (
            0 if e.preferred_date == appointment_date else 1,
            e.created_at,
        ),
    )


def notify_waiting_list_for_freed_slot(appointment_date, procedure_ids=None):
    """Recommend and notify the top-ranked waiting-list patient when a slot opens."""
    from appointments.models import WaitingListEntry

    matches = _matching_waiting_list_entries(appointment_date, procedure_ids)
    WaitingListEntry.objects.filter(is_active=True).update(suggested_for_date=None)

    if not matches:
        return

    top_entry = matches[0]
    top_entry.suggested_for_date = appointment_date
    top_entry.save(update_fields=["suggested_for_date"])
    notify_waiting_list_slot(top_entry, appointment_date)


def notify_appointment_confirmed(appointment):
    message = (
        f"Your appointment on {appointment.appointment_date} "
        f"at {appointment.start_time.strftime('%I:%M %p')} is confirmed."
    )
    create_notification(
        user=appointment.patient,
        notification_type=Notification.Type.APPOINTMENT_CONFIRMED,
        title="Appointment confirmed",
        message=message,
        appointment=appointment,
    )
    subject, text_body = build_appointment_confirmed_email(appointment)
    _try_send_email(appointment.patient.email, subject, text_body)


def notify_appointment_cancelled(appointment, fee=0):
    fee_msg = f" A cancellation fee of ₱{fee} applies." if fee else ""
    message = (
        f"Your appointment on {appointment.appointment_date} "
        f"at {appointment.start_time.strftime('%I:%M %p')} was cancelled.{fee_msg}"
    )
    create_notification(
        user=appointment.patient,
        notification_type=Notification.Type.APPOINTMENT_CANCELLED,
        title="Appointment cancelled",
        message=message,
        appointment=appointment,
    )
    subject, text_body = build_appointment_cancelled_email(appointment, fee)
    _try_send_email(appointment.patient.email, subject, text_body)


def notify_waiting_list_slot(entry, appointment_date):
    message = (
        f"A slot opened on {appointment_date}. "
        "Book now before it is taken."
    )
    create_notification(
        user=entry.patient,
        notification_type=Notification.Type.WAITING_LIST_SLOT,
        title="Slot available",
        message=message,
    )
    subject, text_body = build_waiting_list_slot_email(appointment_date)
    _try_send_email(entry.patient.email, subject, text_body)


def notify_appointment_reminder(appointment):
    message = (
        f"Reminder: you have an appointment tomorrow "
        f"({appointment.appointment_date}) at "
        f"{appointment.start_time.strftime('%I:%M %p')}."
    )
    create_notification(
        user=appointment.patient,
        notification_type=Notification.Type.APPOINTMENT_REMINDER,
        title="Appointment reminder",
        message=message,
        appointment=appointment,
    )
    subject, text_body = build_appointment_reminder_email(appointment)
    _try_send_email(appointment.patient.email, subject, text_body)


def notify_follow_up_reminder(appointment):
    message = (
        f"Follow-up: please contact the clinic if you need another visit "
        f"after your appointment on {appointment.appointment_date}."
    )
    create_notification(
        user=appointment.patient,
        notification_type=Notification.Type.FOLLOW_UP_REMINDER,
        title="Follow-up reminder",
        message=message,
        appointment=appointment,
    )
    subject, text_body = build_follow_up_reminder_email(appointment)
    _try_send_email(appointment.patient.email, subject, text_body)


def reminder_already_sent(appointment, notification_type):
    return Notification.objects.filter(
        appointment=appointment,
        notification_type=notification_type,
    ).exists()
