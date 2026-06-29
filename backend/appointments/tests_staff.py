from datetime import date, datetime, time, timedelta
from decimal import Decimal
from unittest.mock import patch

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

        cls.dentist = User.objects.create_user(
            email="dentist@test.com",
            password="TestPass123!",
            first_name="Den",
            last_name="Tist",
        )
        dentist_role = Role.objects.get(slug=Role.DENTIST)
        UserRole.objects.create(user=cls.dentist, role=dentist_role)

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

    def _future_clinic_date(self, days_ahead=2):
        candidate = timezone.localdate() + timedelta(days=days_ahead)
        while candidate.weekday() == 6:
            candidate += timedelta(days=1)
        return candidate

    def _create_confirmed_appointment(self, appt_date, start, end):
        appt = Appointment.objects.create(
            patient=self.patient,
            appointment_date=appt_date,
            start_time=start,
            end_time=end,
            status=Appointment.Status.CONFIRMED,
            total_duration_minutes=60,
            total_amount="500.00",
        )
        appt.procedures.add(self.procedure)
        return appt

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

    def test_receptionist_can_load_booking_reference_data(self):
        """Staff Book Appointment page uses patient booking reference endpoints."""
        self._auth(self.receptionist)
        tomorrow = self._future_clinic_date()

        clinic_resp = self.client.get("/api/appointments/clinic-info/")
        self.assertEqual(clinic_resp.status_code, status.HTTP_200_OK)
        self.assertIn("pencil_booking_hours", clinic_resp.data)

        proc_resp = self.client.get("/api/appointments/procedures/")
        self.assertEqual(proc_resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(proc_resp.data), 1)

        slots_resp = self.client.get(
            f"/api/appointments/slots/compatible/?procedure_ids={self.procedure.id}&date={tomorrow.isoformat()}"
        )
        self.assertEqual(slots_resp.status_code, status.HTTP_200_OK)
        self.assertIn("slots", slots_resp.data)

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

    def test_receptionist_reschedules_confirmed_appointment(self):
        tomorrow = self._future_clinic_date()
        appt = self._create_confirmed_appointment(tomorrow, time(10, 0), time(11, 0))
        new_date = self._future_clinic_date(days_ahead=4)

        self._auth(self.receptionist)
        slots_resp = self.client.get(
            "/api/appointments/staff/slots/",
            {"date": new_date.isoformat(), "duration_minutes": 60},
        )
        self.assertEqual(slots_resp.status_code, status.HTTP_200_OK)
        slots = slots_resp.data.get("slots") or []
        self.assertTrue(slots, "Expected at least one staff slot")

        response = self.client.post(
            f"/api/appointments/staff/{appt.id}/reschedule/",
            {
                "appointment_date": new_date.isoformat(),
                "start_time": slots[0]["start_time"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        appt.refresh_from_db()
        self.assertEqual(appt.appointment_date, new_date)
        self.assertEqual(appt.start_time.strftime("%H:%M"), slots[0]["start_time"])

    def test_dentist_reschedules_confirmed_appointment(self):
        tomorrow = self._future_clinic_date()
        appt = self._create_confirmed_appointment(tomorrow, time(11, 0), time(12, 0))
        new_date = self._future_clinic_date(days_ahead=5)

        self._auth(self.dentist)
        slots_resp = self.client.get(
            "/api/appointments/staff/slots/",
            {"date": new_date.isoformat(), "duration_minutes": 60},
        )
        self.assertEqual(slots_resp.status_code, status.HTTP_200_OK)
        slots = slots_resp.data.get("slots") or []
        self.assertTrue(slots)

        response = self.client.post(
            f"/api/appointments/staff/{appt.id}/reschedule/",
            {
                "appointment_date": new_date.isoformat(),
                "start_time": slots[0]["start_time"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        appt.refresh_from_db()
        self.assertEqual(appt.appointment_date, new_date)

    def test_cannot_complete_before_start_time(self):
        today = timezone.localdate()
        while today.weekday() == 6:
            today += timedelta(days=1)
        appt = self._create_confirmed_appointment(today, time(14, 0), time(15, 0))
        mock_now = timezone.make_aware(datetime.combine(today, time(10, 0)))

        self._auth(self.receptionist)
        with patch("appointments.services.timezone.localtime", return_value=mock_now):
            response = self.client.patch(
                f"/api/appointments/staff/{appt.id}/",
                {"status": "completed"},
                format="json",
            )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("scheduled time", str(response.data).lower())

    def test_cannot_complete_on_wrong_date(self):
        tomorrow = self._future_clinic_date()
        appt = self._create_confirmed_appointment(tomorrow, time(10, 0), time(11, 0))
        mock_now = timezone.make_aware(
            datetime.combine(timezone.localdate(), time(10, 30))
        )

        self._auth(self.receptionist)
        with patch("appointments.services.timezone.localtime", return_value=mock_now):
            response = self.client.patch(
                f"/api/appointments/staff/{appt.id}/",
                {"status": "completed"},
                format="json",
            )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_can_complete_during_slot_with_grace(self):
        today = timezone.localdate()
        while today.weekday() == 6:
            today += timedelta(days=1)
        appt = self._create_confirmed_appointment(today, time(10, 0), time(11, 0))
        mock_now = timezone.make_aware(datetime.combine(today, time(11, 15)))

        self._auth(self.receptionist)
        with patch("appointments.services.timezone.localtime", return_value=mock_now):
            response = self.client.patch(
                f"/api/appointments/staff/{appt.id}/",
                {"status": "completed"},
                format="json",
            )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        appt.refresh_from_db()
        self.assertEqual(appt.status, Appointment.Status.COMPLETED)
        self.assertTrue(response.data.get("can_complete") is False)

    def test_can_complete_field_true_during_window(self):
        today = timezone.localdate()
        while today.weekday() == 6:
            today += timedelta(days=1)
        appt = self._create_confirmed_appointment(today, time(10, 0), time(11, 0))
        mock_now = timezone.make_aware(datetime.combine(today, time(10, 30)))

        self._auth(self.receptionist)
        with patch("appointments.services.timezone.localtime", return_value=mock_now):
            response = self.client.get(f"/api/appointments/staff/{appt.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get("can_complete"))
