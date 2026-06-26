from datetime import date, time, timedelta

from decimal import Decimal

from django.test import override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from appointments.models import Appointment, Procedure, WaitingListEntry
from billing.models import BillingRecord
from users.models import Role, User, UserRole


@override_settings(ALLOWED_HOSTS=["testserver", "localhost", "127.0.0.1"])
class StaffAPITestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.patient = User.objects.create_user(
            email="patient@test.com",
            password="TestPass123!",
            first_name="Pat",
            last_name="Ient",
        )
        user_role = Role.objects.get(slug=Role.USER)
        UserRole.objects.create(user=cls.patient, role=user_role)

        cls.receptionist = User.objects.create_user(
            email="reception@test.com",
            password="TestPass123!",
            first_name="Recep",
            last_name="Tion",
        )
        recep_role = Role.objects.get(slug=Role.RECEPTIONIST)
        UserRole.objects.create(user=cls.receptionist, role=recep_role)

        cls.procedure = Procedure.objects.filter(is_active=True).first()
        if cls.procedure is None:
            cls.procedure = Procedure.objects.create(
                name="Checkup",
                slug="checkup",
                duration_minutes=60,
                price="500.00",
            )

    def _auth(self, user):
        self.client.force_authenticate(user=user)

    def test_patient_cannot_access_staff_appointments(self):
        self._auth(self.patient)
        response = self.client.get("/api/appointments/staff/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_receptionist_lists_all_appointments(self):
        tomorrow = timezone.localdate() + timedelta(days=1)
        while tomorrow.weekday() == 6:
            tomorrow += timedelta(days=1)
        Appointment.objects.create(
            patient=self.patient,
            appointment_date=tomorrow,
            start_time=time(10, 0),
            end_time=time(11, 0),
            status=Appointment.Status.CONFIRMED,
            total_duration_minutes=60,
            total_amount="500.00",
        )

        self._auth(self.receptionist)
        response = self.client.get("/api/appointments/staff/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data["count"], 1)

    def test_receptionist_daily_schedule(self):
        self._auth(self.receptionist)
        today = timezone.localdate().isoformat()
        response = self.client.get(f"/api/appointments/staff/schedule/?date={today}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["date"], today)

    def test_receptionist_patient_registry(self):
        self._auth(self.receptionist)
        response = self.client.get("/api/patients/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        emails = [row["email"] for row in response.data["results"]]
        self.assertIn("patient@test.com", emails)

    def test_receptionist_staff_billing(self):
        BillingRecord.objects.create(
            patient=self.patient,
            total_amount=Decimal("500.00"),
            amount_paid=Decimal("0.00"),
        )
        self._auth(self.receptionist)
        response = self.client.get("/api/billing/staff/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data["count"], 1)

    def test_receptionist_staff_waiting_list(self):
        WaitingListEntry.objects.create(patient=self.patient, is_active=True)
        self._auth(self.receptionist)
        response = self.client.get("/api/appointments/waiting-list/staff/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_receptionist_patches_appointment_status(self):
        tomorrow = timezone.localdate() + timedelta(days=2)
        while tomorrow.weekday() == 6:
            tomorrow += timedelta(days=1)
        appt = Appointment.objects.create(
            patient=self.patient,
            appointment_date=tomorrow,
            start_time=time(14, 0),
            end_time=time(15, 0),
            status=Appointment.Status.PENCIL_BOOKED,
            total_duration_minutes=60,
            total_amount="500.00",
        )
        self._auth(self.receptionist)
        response = self.client.patch(
            f"/api/appointments/staff/{appt.id}/",
            {"status": "confirmed"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        appt.refresh_from_db()
        self.assertEqual(appt.status, Appointment.Status.CONFIRMED)
