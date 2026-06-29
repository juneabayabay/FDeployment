from unittest.mock import patch

from django.contrib.auth.tokens import default_token_generator
from django.test import override_settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.test import APITestCase

from appointments.models import Appointment, Procedure
from users.models import Role, User, UserRole


@override_settings(ALLOWED_HOSTS=["testserver", "localhost", "127.0.0.1"])
class EmailVerificationAPITestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.procedure = Procedure.objects.filter(is_active=True).first()
        if cls.procedure is None:
            cls.procedure = Procedure.objects.create(
                name="Checkup",
                slug="checkup",
                duration_minutes=60,
                price="500.00",
            )

    def _register_patient(self, email="verify@test.com"):
        with patch("users.views.send_email_verification", return_value=(True, None)):
            response = self.client.post(
                "/api/users/register/",
                {
                    "email": email,
                    "first_name": "Verify",
                    "last_name": "Me",
                    "password": "TestPass123!",
                    "password_confirm": "TestPass123!",
                },
                format="json",
            )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email=email)
        self.assertIsNone(user.email_verified_at)
        return user, response

    def test_register_sends_verification_message(self):
        with patch("users.views.send_email_verification", return_value=(True, None)) as mock_send:
            response = self.client.post(
                "/api/users/register/",
                {
                    "email": "newpatient@test.com",
                    "first_name": "New",
                    "last_name": "Patient",
                    "password": "TestPass123!",
                    "password_confirm": "TestPass123!",
                },
                format="json",
            )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        mock_send.assert_called_once()
        self.assertIn("verify", response.data.get("message", "").lower())

    def test_verify_email_sets_timestamp(self):
        user, _ = self._register_patient("confirmed@test.com")
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        response = self.client.post(
            "/api/users/verify-email/",
            {"uid": uid, "token": token},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertIsNotNone(user.email_verified_at)

    def test_unverified_patient_cannot_book(self):
        from datetime import timedelta

        from django.utils import timezone

        user, _ = self._register_patient("unverified@test.com")
        self.client.force_authenticate(user=user)
        tomorrow = timezone.localdate() + timedelta(days=2)
        while tomorrow.weekday() == 6:
            tomorrow += timedelta(days=1)

        slots = self.client.get(
            f"/api/appointments/slots/compatible/?procedure_ids={self.procedure.id}&date={tomorrow.isoformat()}"
        )
        start_time = slots.data["slots"][0]["start_time"]

        response = self.client.post(
            "/api/appointments/",
            {
                "appointment_date": tomorrow.isoformat(),
                "start_time": start_time,
                "procedure_ids": [self.procedure.id],
                "booking_type": "pencil",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("verify", str(response.data).lower())

    def test_verified_patient_can_book(self):
        from datetime import timedelta

        from django.utils import timezone

        user, _ = self._register_patient("booker@test.com")
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        self.client.post(
            "/api/users/verify-email/",
            {"uid": uid, "token": token},
            format="json",
        )
        user.refresh_from_db()
        self.client.force_authenticate(user=user)
        tomorrow = timezone.localdate() + timedelta(days=2)
        while tomorrow.weekday() == 6:
            tomorrow += timedelta(days=1)

        slots = self.client.get(
            f"/api/appointments/slots/compatible/?procedure_ids={self.procedure.id}&date={tomorrow.isoformat()}"
        )
        self.assertEqual(slots.status_code, status.HTTP_200_OK)
        self.assertTrue(slots.data.get("slots"), slots.data)
        start_time = slots.data["slots"][0]["start_time"]

        response = self.client.post(
            "/api/appointments/",
            {
                "appointment_date": tomorrow.isoformat(),
                "start_time": start_time,
                "procedure_ids": [self.procedure.id],
                "booking_type": "pencil",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_unverified_patient_can_login(self):
        user, _ = self._register_patient("login@test.com")
        response = self.client.post(
            "/api/users/token/",
            {"email": user.email, "password": "TestPass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["user"]["email_verification_required"])

    def test_password_reset_still_works(self):
        user, _ = self._register_patient("reset@test.com")
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        response = self.client.post(
            "/api/users/password/reset/",
            {
                "uid": uid,
                "token": token,
                "new_password": "NewPass456!",
                "new_password_confirm": "NewPass456!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
