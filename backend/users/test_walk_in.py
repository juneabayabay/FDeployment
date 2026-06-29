from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from appointments.models import Appointment, Procedure
from users.models import Role, User, UserRole
from users.walk_in import is_walk_in_placeholder_email


@override_settings(ALLOWED_HOSTS=["testserver", "localhost", "127.0.0.1"])
class WalkInPatientAPITestCase(APITestCase):
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

    def test_receptionist_creates_walk_in_with_phone_only(self):
        self._auth(self.receptionist)
        response = self.client.post(
            "/api/patients/walk-in/",
            {
                "first_name": "Walk",
                "last_name": "In",
                "phone": "09171234567",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["is_walk_in_account"])
        self.assertTrue(is_walk_in_placeholder_email(response.data["email"]))
        self.assertIsNone(response.data["email_verified_at"])

        user = User.objects.get(pk=response.data["id"])
        self.assertTrue(user.is_active)
        self.assertFalse(user.has_usable_password())
        self.assertEqual(list(user.role_slugs), ["user"])

    def test_walk_in_cannot_login(self):
        self._auth(self.receptionist)
        created = self.client.post(
            "/api/patients/walk-in/",
            {
                "first_name": "No",
                "last_name": "Login",
                "phone": "09179876543",
            },
            format="json",
        )
        email = created.data["email"]
        self.client.force_authenticate(user=None)

        response = self.client.post(
            "/api/users/token/",
            {"email": email, "password": "anything"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("clinic", str(response.data).lower())

    def test_public_register_still_requires_email_and_password(self):
        response = self.client.post(
            "/api/users/register/",
            {
                "first_name": "Online",
                "last_name": "Patient",
                "phone": "09171112222",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_staff_books_appointment_for_walk_in_patient(self):
        from datetime import time, timedelta

        from django.utils import timezone

        self._auth(self.receptionist)
        created = self.client.post(
            "/api/patients/walk-in/",
            {
                "first_name": "Book",
                "last_name": "Now",
                "phone": "09173334444",
            },
            format="json",
        )
        patient_id = created.data["id"]
        tomorrow = timezone.localdate() + timedelta(days=2)
        while tomorrow.weekday() == 6:
            tomorrow += timedelta(days=1)

        slots = self.client.get(
            "/api/appointments/staff/slots/",
            {"date": tomorrow.isoformat(), "duration_minutes": 60},
        )
        start_time = slots.data["slots"][0]["start_time"]

        book = self.client.post(
            "/api/appointments/staff/",
            {
                "patient_id": patient_id,
                "appointment_date": tomorrow.isoformat(),
                "start_time": start_time,
                "procedure_ids": [self.procedure.id],
                "booking_type": "pencil",
                "booking_source": "walk_in",
            },
            format="json",
        )
        self.assertEqual(book.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Appointment.objects.filter(patient_id=patient_id).count(), 1)

    def test_staff_can_add_real_email_to_walk_in(self):
        self._auth(self.receptionist)
        created = self.client.post(
            "/api/patients/walk-in/",
            {
                "first_name": "Email",
                "last_name": "Later",
                "phone": "09175556666",
            },
            format="json",
        )
        patient_id = created.data["id"]
        response = self.client.patch(
            f"/api/patients/{patient_id}/",
            {"email": "walkin.real@test.com"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "walkin.real@test.com")
        self.assertTrue(response.data["is_walk_in_account"])
