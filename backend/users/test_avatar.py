from io import BytesIO

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import Role, User, UserRole


def _make_test_image(name="avatar.png", fmt="PNG", size=(32, 32)):
    buffer = BytesIO()
    Image.new("RGB", size, color="red").save(buffer, format=fmt)
    buffer.seek(0)
    content_type = {
        "PNG": "image/png",
        "JPEG": "image/jpeg",
        "WEBP": "image/webp",
    }[fmt]
    return SimpleUploadedFile(name, buffer.read(), content_type=content_type)


@override_settings(ALLOWED_HOSTS=["testserver", "localhost", "127.0.0.1"])
class AvatarAPITestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.patient = User.objects.create_user(
            email="patient-avatar@test.com",
            password="TestPass123!",
            first_name="Pat",
            last_name="Avatar",
        )
        user_role = Role.objects.get(slug=Role.USER)
        UserRole.objects.create(user=cls.patient, role=user_role)

        cls.dentist = User.objects.create_user(
            email="dentist-avatar@test.com",
            password="TestPass123!",
            first_name="Den",
            last_name="Tist",
            is_staff=True,
        )
        dentist_role = Role.objects.get(slug=Role.DENTIST)
        UserRole.objects.create(user=cls.dentist, role=dentist_role)

    def _login(self, email):
        response = self.client.post(
            "/api/users/token/",
            {"email": email, "password": "TestPass123!"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_upload_avatar_returns_url(self):
        self._login("patient-avatar@test.com")
        response = self.client.post(
            "/api/users/me/avatar/",
            {"avatar": _make_test_image()},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("avatar_url", response.data)
        self.assertTrue(response.data["avatar_url"])
        self.assertIn("/media/avatars/", response.data["avatar_url"])

        self.patient.refresh_from_db()
        self.assertTrue(self.patient.avatar)

    def test_upload_rejects_invalid_type(self):
        self._login("patient-avatar@test.com")
        bad_file = SimpleUploadedFile(
            "notes.txt",
            b"not an image",
            content_type="text/plain",
        )
        response = self.client.post(
            "/api/users/me/avatar/",
            {"avatar": bad_file},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("avatar", response.data)

    def test_upload_rejects_oversized_file(self):
        self._login("dentist-avatar@test.com")
        huge = SimpleUploadedFile(
            "big.png",
            b"x" * (5 * 1024 * 1024 + 1),
            content_type="image/png",
        )
        response = self.client.post(
            "/api/users/me/avatar/",
            {"avatar": huge},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_avatar_clears_upload(self):
        self._login("patient-avatar@test.com")
        upload = self.client.post(
            "/api/users/me/avatar/",
            {"avatar": _make_test_image()},
            format="multipart",
        )
        self.assertEqual(upload.status_code, status.HTTP_200_OK)

        delete = self.client.delete("/api/users/me/avatar/")
        self.assertEqual(delete.status_code, status.HTTP_200_OK)
        self.assertFalse(delete.data.get("avatar_url"))

        self.patient.refresh_from_db()
        self.assertFalse(self.patient.avatar)

    def test_avatar_requires_auth(self):
        response = self.client.post(
            "/api/users/me/avatar/",
            {"avatar": _make_test_image()},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_update_still_works_after_avatar(self):
        self._login("dentist-avatar@test.com")
        self.client.post(
            "/api/users/me/avatar/",
            {"avatar": _make_test_image("dentist.webp", fmt="WEBP")},
            format="multipart",
        )
        patch = self.client.patch(
            "/api/users/me/",
            {"phone": "09171234567"},
            format="json",
        )
        self.assertEqual(patch.status_code, status.HTTP_200_OK)
        self.assertEqual(patch.data["phone"], "09171234567")

    def test_change_password_still_works_with_avatar(self):
        self._login("patient-avatar@test.com")
        response = self.client.post(
            "/api/users/me/change-password/",
            {
                "current_password": "TestPass123!",
                "new_password": "NewPass456!",
                "new_password_confirm": "NewPass456!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
