from django.core.management.base import BaseCommand

from appointments.models import Appointment
from notifications.services import notify_waiting_list_for_freed_slot


class Command(BaseCommand):
    help = "Expire pencil bookings past their hold window."

    def handle(self, *args, **options):
        expired = 0
        for appt in Appointment.objects.filter(
            status=Appointment.Status.PENCIL_BOOKED
        ).prefetch_related("procedures"):
            if appt.expire_pencil_if_needed():
                expired += 1
                procedure_ids = list(appt.procedures.values_list("id", flat=True))
                notify_waiting_list_for_freed_slot(appt.appointment_date, procedure_ids)

        self.stdout.write(self.style.SUCCESS(f"Expired {expired} pencil booking(s)."))
