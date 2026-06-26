from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import DentistProfile, Role, User, UserRole


@override_settings(ALLOWED_HOSTS=["testserver", "localhost", "127.0.0.1"])
class DentistProfileAPITestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin = User.objects.create_superuser(
            email="admin-dentist@test.com",
            password="TestPass123!",
            first_name="Admin",
            last_name="User",
        )
        admin_role = Role.objects.get(slug=Role.ADMIN)
        UserRole.objects.get_or_create(user=cls.admin, role=admin_role)

        cls.patient = User.objects.create_user(
            email="patient-dentist@test.com",
            password="TestPass123!",
            first_name="Pat",
            last_name="Ient",
        )
        UserRole.objects.create(user=cls.patient, role=Role.objects.get(slug=Role.USER))

        cls.dentist_user = User.objects.create_user(
            email="dentist-profile@test.com",
            password="TestPass123!",
            first_name="Den",
            last_name="Tist",
            is_staff=True,
        )
        UserRole.objects.create(
            user=cls.dentist_user,
            role=Role.objects.get(slug=Role.DENTIST),
        )
        cls.profile = DentistProfile.objects.get(user=cls.dentist_user)
        cls.profile.specialization = "Orthodontics"
        cls.profile.years_experience = 8
        cls.profile.bio = "Experienced orthodontist."
        cls.profile.schedule_summary = "Mon–Fri 9:00 AM – 5:00 PM"
        cls.profile.save()

        cls.hidden_dentist = User.objects.create_user(
            email="hidden-dentist@test.com",
            password="TestPass123!",
            first_name="Hidden",
            last_name="Dentist",
            is_staff=True,
        )
        UserRole.objects.create(
            user=cls.hidden_dentist,
            role=Role.objects.get(slug=Role.DENTIST),
        )
        hidden_profile = DentistProfile.objects.get(user=cls.hidden_dentist)
        hidden_profile.is_visible = False
        hidden_profile.save()

    def _login(self, email):
        response = self.client.post(
            "/api/users/token/",
            {"email": email, "password": "TestPass123!"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_patient_directory_lists_visible_dentists_only(self):
        self._login("patient-dentist@test.com")
        response = self.client.get("/api/users/dentists/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        emails = [item["email"] for item in response.data["results"]]
        self.assertIn("dentist-profile@test.com", emails)
        self.assertNotIn("hidden-dentist@test.com", emails)

    def test_admin_directory_lists_all_dentists(self):
        self._login("admin-dentist@test.com")
        response = self.client.get("/api/users/dentists/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        emails = [item["email"] for item in response.data["results"]]
        self.assertIn("hidden-dentist@test.com", emails)

    def test_dentist_updates_own_profile(self):
        self._login("dentist-profile@test.com")
        response = self.client.patch(
            "/api/users/me/dentist-profile/",
            {"bio": "Updated bio text.", "schedule_summary": "Tue–Sat 10–6"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["bio"], "Updated bio text.")
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.schedule_summary, "Tue–Sat 10–6")

    def test_patient_cannot_update_dentist_profile(self):
        self._login("patient-dentist@test.com")
        response = self.client.patch(
            "/api/users/me/dentist-profile/",
            {"bio": "Hacked"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_creates_dentist_profile(self):
        new_dentist = User.objects.create_user(
            email="new-dentist@test.com",
            password="TestPass123!",
            first_name="New",
            last_name="Dentist",
            is_staff=True,
        )
        UserRole.objects.create(
            user=new_dentist,
            role=Role.objects.get(slug=Role.DENTIST),
        )
        DentistProfile.objects.filter(user=new_dentist).delete()

        self._login("admin-dentist@test.com")
        response = self.client.post(
            "/api/users/dentist-profiles/",
            {
                "user_id": new_dentist.id,
                "specialization": "General Dentistry",
                "years_experience": 3,
                "schedule_summary": "Mon–Thu",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            DentistProfile.objects.filter(user=new_dentist).exists()
        )

    def test_directory_detail(self):
        self._login("patient-dentist@test.com")
        response = self.client.get(f"/api/users/dentists/{self.profile.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["specialization"], "Orthodontics")
        self.assertEqual(response.data["display_name"], "Dr. Den Tist")
