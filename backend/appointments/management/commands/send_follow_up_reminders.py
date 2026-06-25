from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from appointments.models import Appointment
from notifications.services import notify_follow_up_reminder, reminder_already_sent


class Command(BaseCommand):
    help = "Send follow-up reminders for visits completed 7 days ago."

    def handle(self, *args, **options):
        target_date = timezone.localdate() - timedelta(days=7)
        appointments = Appointment.objects.filter(
            appointment_date=target_date,
            status=Appointment.Status.COMPLETED,
        ).select_related("patient")

        sent = 0
        for appt in appointments:
            if reminder_already_sent(appt, "follow_up_reminder"):
                continue
            notify_follow_up_reminder(appt)
            sent += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Sent {sent} follow-up reminder(s) for visits on {target_date}."
            )
        )
