from datetime import date, timedelta
from decimal import Decimal
from unittest.mock import patch

from django.test import override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from appointments.models import Procedure
from users.models import Role, User, UserRole


@override_settings(ALLOWED_HOSTS=["testserver", "localhost", "127.0.0.1"])
class SecurityHardeningTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.patient = User.objects.create_user(
            email="patient@test.com",
            password="TestPass123!",
            first_name="Pat",
            last_name="Ient",
            email_verified_at=timezone.now(),
        )
        user_role = Role.objects.get(slug=Role.USER)
        UserRole.objects.create(user=cls.patient, role=user_role)

        cls.receptionist = User.objects.create_user(
            email="reception@test.com",
            password="TestPass123!",
            first_name="Rec",
            last_name="Eptionist",
        )
        recep_role = Role.objects.get(slug=Role.RECEPTIONIST)
        UserRole.objects.create(user=cls.receptionist, role=recep_role)

        cls.procedure, _ = Procedure.objects.get_or_create(
            slug="security-test-cleaning",
            defaults={
                "name": "Cleaning",
                "category": "minor",
                "duration_minutes": 30,
                "price": Decimal("500.00"),
            },
        )

        cls.booking_date = timezone.localdate() + timedelta(days=1)
        while cls.booking_date.weekday() == 6:
            cls.booking_date += timedelta(days=1)

    def _auth(self, user):
        self.client.force_authenticate(user=user)

    def _book_payload(self, start_time="09:00"):
        return {
            "appointment_date": self.booking_date.isoformat(),
            "start_time": start_time,
            "procedure_ids": [self.procedure.id],
            "booking_type": "pencil",
        }

    def test_receptionist_cannot_create_braces_billing_directly(self):
        self._auth(self.receptionist)
        response = self.client.post(
            "/api/billing/staff/",
            {
                "patient_id": self.patient.id,
                "description": "Orthodontic down payment",
                "total_amount": "5000.00",
                "amount_paid": "0",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("approval workflow", response.data["description"][0].lower())

    def test_receptionist_cannot_set_negative_billing_amounts(self):
        self._auth(self.receptionist)
        response = self.client.post(
            "/api/billing/staff/",
            {
                "patient_id": self.patient.id,
                "description": "Consultation fee",
                "total_amount": "-100.00",
                "amount_paid": "0",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("appointments.serializers.assert_slot_available")
    def test_booking_rechecks_slot_under_lock(self, mock_assert):
        self._auth(self.patient)
        response = self.client.post(
            "/api/appointments/",
            self._book_payload(),
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        mock_assert.assert_called_once()

    def test_second_booking_same_slot_rejected(self):
        self._auth(self.patient)
        payload = self._book_payload("10:00")

        first = self.client.post("/api/appointments/", payload, format="json")
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)

        other = User.objects.create_user(
            email="other@test.com",
            password="TestPass123!",
            first_name="Other",
            last_name="Patient",
        )
        UserRole.objects.create(user=other, role=Role.objects.get(slug=Role.USER))
        self._auth(other)

        second = self.client.post("/api/appointments/", payload, format="json")
        self.assertEqual(second.status_code, status.HTTP_400_BAD_REQUEST)
