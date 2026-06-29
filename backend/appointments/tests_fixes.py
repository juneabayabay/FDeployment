from datetime import date, time, timedelta
from decimal import Decimal
from unittest.mock import patch

from django.test import override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from appointments.models import Appointment, Procedure, WaitingListEntry
from billing.models import BillingRecord, DownPaymentRequest
from notifications.models import Notification
from users.models import Role, User, UserRole


@override_settings(ALLOWED_HOSTS=["testserver", "localhost", "127.0.0.1"])
class AuditFixesTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.patient = User.objects.create_user(
            email="patient-fix@test.com",
            password="TestPass123!",
            first_name="Pat",
            last_name="Fix",
        )
        UserRole.objects.create(user=cls.patient, role=Role.objects.get(slug=Role.USER))

        cls.other_patient = User.objects.create_user(
            email="other-fix@test.com",
            password="TestPass123!",
            first_name="Other",
            last_name="Patient",
        )
        UserRole.objects.create(user=cls.other_patient, role=Role.objects.get(slug=Role.USER))

        cls.admin = User.objects.create_superuser(
            email="admin-fix@test.com",
            password="TestPass123!",
            first_name="Admin",
            last_name="Fix",
        )
        UserRole.objects.create(user=cls.admin, role=Role.objects.get(slug=Role.ADMIN))

        cls.receptionist = User.objects.create_user(
            email="recep-fix@test.com",
            password="TestPass123!",
            first_name="Rec",
            last_name="Fix",
            is_staff=True,
        )
        UserRole.objects.create(
            user=cls.receptionist,
            role=Role.objects.get(slug=Role.RECEPTIONIST),
        )

        cls.dentist = User.objects.create_user(
            email="dentist-fix@test.com",
            password="TestPass123!",
            first_name="Den",
            last_name="Tist",
            is_staff=True,
        )
        UserRole.objects.create(user=cls.dentist, role=Role.objects.get(slug=Role.DENTIST))

        cls.procedure, _ = Procedure.objects.get_or_create(
            slug="audit-fix-cleaning",
            defaults={
                "name": "Cleaning",
                "category": "minor",
                "duration_minutes": 30,
                "price": Decimal("500.00"),
            },
        )
        cls.booking_date = timezone.localdate() + timedelta(days=3)
        while cls.booking_date.weekday() == 6:
            cls.booking_date += timedelta(days=1)

    def _auth(self, user):
        self.client.force_authenticate(user=user)

    def test_waiting_list_notifies_matching_date_only(self):
        WaitingListEntry.objects.create(
            patient=self.other_patient,
            preferred_date=self.booking_date,
            is_active=True,
        )
        far_entry = WaitingListEntry.objects.create(
            patient=self.patient,
            preferred_date=self.booking_date + timedelta(days=14),
            is_active=True,
        )

        appt = Appointment.objects.create(
            patient=self.patient,
            appointment_date=self.booking_date,
            start_time=time(10, 0),
            end_time=time(10, 30),
            status=Appointment.Status.CONFIRMED,
            total_duration_minutes=30,
            total_amount=Decimal("500.00"),
        )
        appt.procedures.add(self.procedure)

        self._auth(self.patient)
        with patch("notifications.services._try_send_email"):
            self.client.post(f"/api/appointments/{appt.id}/cancel/")

        self.assertTrue(
            Notification.objects.filter(
                user=self.other_patient,
                notification_type=Notification.Type.WAITING_LIST_SLOT,
            ).exists()
        )
        self.assertFalse(
            Notification.objects.filter(
                user=far_entry.patient,
                notification_type=Notification.Type.WAITING_LIST_SLOT,
            ).exists()
        )

    def test_cancellation_creates_billing_fee(self):
        appt = Appointment.objects.create(
            patient=self.patient,
            appointment_date=self.booking_date,
            start_time=time(11, 0),
            end_time=time(11, 30),
            status=Appointment.Status.CONFIRMED,
            total_duration_minutes=30,
            total_amount=Decimal("500.00"),
        )

        self._auth(self.patient)
        with patch("notifications.services._try_send_email"):
            with patch(
                "appointments.views.calculate_cancellation_fee",
                return_value=Decimal("300.00"),
            ):
                response = self.client.post(f"/api/appointments/{appt.id}/cancel/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            BillingRecord.objects.filter(
                patient=self.patient,
                appointment=appt,
                total_amount=Decimal("300.00"),
            ).exists()
        )

    def test_cancellation_adds_fee_to_existing_billing(self):
        appt = Appointment.objects.create(
            patient=self.patient,
            appointment_date=self.booking_date,
            start_time=time(11, 30),
            end_time=time(12, 0),
            status=Appointment.Status.CONFIRMED,
            total_duration_minutes=30,
            total_amount=Decimal("1000.00"),
        )
        BillingRecord.objects.create(
            patient=self.patient,
            appointment=appt,
            total_amount=Decimal("1000.00"),
        )

        self._auth(self.patient)
        with patch("notifications.services._try_send_email"):
            with patch(
                "appointments.views.calculate_cancellation_fee",
                return_value=Decimal("300.00"),
            ):
                response = self.client.post(f"/api/appointments/{appt.id}/cancel/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        appt.refresh_from_db()
        self.assertEqual(appt.status, Appointment.Status.CANCELLED)
        bill = BillingRecord.objects.get(appointment=appt)
        self.assertEqual(bill.total_amount, Decimal("1300.00"))
        self.assertIn("Cancellation fee", bill.description)

    def test_no_show_creates_billing_fee(self):
        appt = Appointment.objects.create(
            patient=self.patient,
            appointment_date=self.booking_date,
            start_time=time(13, 0),
            end_time=time(13, 30),
            status=Appointment.Status.CONFIRMED,
            total_duration_minutes=30,
            total_amount=Decimal("500.00"),
        )

        self._auth(self.receptionist)
        with patch("notifications.services._try_send_email"):
            response = self.client.patch(
                f"/api/appointments/staff/{appt.id}/",
                {"status": "no_show"},
                format="json",
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            BillingRecord.objects.filter(
                patient=self.patient,
                description__icontains="No-show fee",
            ).exists()
        )

    def test_non_superuser_cannot_assign_admin_role(self):
        staff_admin = User.objects.create_user(
            email="staff-admin@test.com",
            password="TestPass123!",
            first_name="Staff",
            last_name="Admin",
            is_staff=True,
        )
        UserRole.objects.create(user=staff_admin, role=Role.objects.get(slug=Role.ADMIN))
        self._auth(staff_admin)
        admin_role = Role.objects.get(slug=Role.ADMIN)
        target = User.objects.create_user(
            email="target@test.com",
            password="TestPass123!",
            first_name="Target",
            last_name="User",
        )
        response = self.client.post(
            "/api/users/user-roles/",
            {"user": target.id, "role_id": admin_role.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_staff_billing_accepts_payment_method(self):
        self._auth(self.receptionist)
        response = self.client.post(
            "/api/billing/staff/",
            {
                "patient_id": self.patient.id,
                "description": "Consultation",
                "total_amount": "500.00",
                "amount_paid": "500.00",
                "payment_method": "gcash",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        record = BillingRecord.objects.get(pk=response.data["id"])
        self.assertEqual(record.payment_method, "gcash")

    def test_email_settings_patch_rejected(self):
        self._auth(self.receptionist)
        response = self.client.patch(
            "/api/settings/email/",
            {"smtp_app_password": "secret"},
            format="json",
        )
        self.assertIn(response.status_code, (status.HTTP_400_BAD_REQUEST, status.HTTP_403_FORBIDDEN))

    def test_down_payment_double_approve_rejected(self):
        req = DownPaymentRequest.objects.create(
            patient=self.patient,
            amount=Decimal("1000.00"),
            description="Braces down payment",
        )
        self._auth(self.dentist)
        first = self.client.post(f"/api/billing/staff/down-payments/{req.id}/approve/")
        second = self.client.post(f"/api/billing/staff/down-payments/{req.id}/approve/")
        self.assertEqual(first.status_code, status.HTTP_200_OK)
        self.assertEqual(second.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            BillingRecord.objects.filter(patient=self.patient, total_amount=Decimal("1000.00")).count(),
            1,
        )
