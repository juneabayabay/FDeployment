from datetime import date, time, timedelta

from django.test import override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from appointments.models import Appointment, Procedure
from appointments.services import generate_time_slots
from users.models import DentistProfile, Role, User, UserRole


@override_settings(ALLOWED_HOSTS=["testserver", "localhost", "127.0.0.1"])
class AppointmentDentistFKTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.patient = User.objects.create_user(
            email="patient-appt@test.com",
            password="TestPass123!",
            first_name="Pat",
            last_name="Ient",
        )
        UserRole.objects.create(user=cls.patient, role=Role.objects.get(slug=Role.USER))

        cls.dentist = User.objects.create_user(
            email="dentist-appt@test.com",
            password="TestPass123!",
            first_name="Den",
            last_name="Tist",
            is_staff=True,
        )
        UserRole.objects.create(user=cls.dentist, role=Role.objects.get(slug=Role.DENTIST))
        DentistProfile.objects.get_or_create(user=cls.dentist)

        cls.procedure = Procedure.objects.filter(is_active=True).first()

    def _login(self, email):
        response = self.client.post(
            "/api/users/token/",
            {"email": email, "password": "TestPass123!"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def _future_weekday(self):
        day = timezone.localdate() + timedelta(days=1)
        while day.weekday() == 6:
            day += timedelta(days=1)
        return day

    def test_patient_booking_stores_dentist_fk(self):
        self._login("patient-appt@test.com")
        appt_date = self._future_weekday()
        slots = generate_time_slots(appt_date, self.procedure.duration_minutes)
        self.assertTrue(slots, "Expected at least one available slot")
        start_time = slots[0]["start_time"]
        response = self.client.post(
            "/api/appointments/",
            {
                "appointment_date": appt_date.isoformat(),
                "start_time": start_time,
                "procedure_ids": [self.procedure.id],
                "booking_type": "pencil",
                "dentist_id": self.dentist.id,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["dentist"]["id"], self.dentist.id)
        self.assertEqual(response.data["dentist"]["full_name"], "Den Tist")

        appointment = Appointment.objects.get(pk=response.data["id"])
        self.assertEqual(appointment.dentist_id, self.dentist.id)

    def test_appointment_list_includes_dentist_summary(self):
        appt_date = self._future_weekday()
        Appointment.objects.create(
            patient=self.patient,
            dentist=self.dentist,
            appointment_date=appt_date,
            start_time=time(10, 0),
            end_time=time(10, 30),
            status=Appointment.Status.CONFIRMED,
            total_duration_minutes=30,
            total_amount=self.procedure.price,
        ).procedures.set([self.procedure])

        self._login("patient-appt@test.com")
        response = self.client.get("/api/appointments/?status=active")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["dentist"]["email"], "dentist-appt@test.com")
