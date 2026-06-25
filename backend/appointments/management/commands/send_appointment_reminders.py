from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from appointments.models import Appointment
from notifications.services import notify_appointment_reminder, reminder_already_sent


class Command(BaseCommand):
    help = "Send 24-hour in-app and email reminders for tomorrow's appointments."

    def handle(self, *args, **options):
        tomorrow = timezone.localdate() + timedelta(days=1)
        active = [
            Appointment.Status.PENDING,
            Appointment.Status.PENCIL_BOOKED,
            Appointment.Status.CONFIRMED,
        ]
        appointments = Appointment.objects.filter(
            appointment_date=tomorrow,
            status__in=active,
        ).select_related("patient")

        sent = 0
        for appt in appointments:
            if reminder_already_sent(appt, "appointment_reminder"):
                continue
            notify_appointment_reminder(appt)
            sent += 1

        self.stdout.write(
            self.style.SUCCESS(f"Sent {sent} appointment reminder(s) for {tomorrow}.")
        )
