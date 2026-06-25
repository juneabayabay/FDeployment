from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import Role, User, UserRole


@override_settings(ALLOWED_HOSTS=["testserver", "localhost", "127.0.0.1"])
class AuthAPITestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin = User.objects.create_superuser(
            email="admin@test.com",
            password="TestPass123!",
            first_name="Admin",
            last_name="User",
        )
        admin_role = Role.objects.get(slug=Role.ADMIN)
        UserRole.objects.get_or_create(user=cls.admin, role=admin_role)

    def test_public_register_assigns_user_role_only(self):
        response = self.client.post(
            "/api/users/register/",
            {
                "email": "patient@test.com",
                "first_name": "Pat",
                "last_name": "Ient",
                "password": "TestPass123!",
                "password_confirm": "TestPass123!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["role_slugs"], ["user"])
        self.assertNotIn("password", response.data)

    def test_public_register_ignores_role_slug_escalation(self):
        response = self.client.post(
            "/api/users/register/",
            {
                "email": "hacker@test.com",
                "first_name": "Hack",
                "last_name": "Er",
                "password": "TestPass123!",
                "password_confirm": "TestPass123!",
                "role_slug": "admin",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="hacker@test.com")
        self.assertEqual(list(user.role_slugs), ["user"])
        self.assertFalse(user.is_staff)

    def test_jwt_login_and_me(self):
        response = self.client.post(
            "/api/users/token/",
            {"email": "admin@test.com", "password": "TestPass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("user", response.data)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
        me = self.client.get("/api/users/me/")
        self.assertEqual(me.status_code, status.HTTP_200_OK)
        self.assertEqual(me.data["email"], "admin@test.com")

    def test_jwt_refresh_and_logout(self):
        login = self.client.post(
            "/api/users/token/",
            {"email": "admin@test.com", "password": "TestPass123!"},
            format="json",
        )
        refresh = login.data["refresh"]

        refreshed = self.client.post(
            "/api/users/token/refresh/",
            {"refresh": refresh},
            format="json",
        )
        self.assertEqual(refreshed.status_code, status.HTTP_200_OK)
        self.assertIn("access", refreshed.data)

        logout = self.client.post(
            "/api/users/token/logout/",
            {"refresh": refreshed.data.get("refresh", refresh)},
            format="json",
        )
        self.assertEqual(logout.status_code, status.HTTP_204_NO_CONTENT)

    def test_unauthenticated_me_returns_401(self):
        response = self.client.get("/api/users/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


@override_settings(ALLOWED_HOSTS=["testserver", "localhost", "127.0.0.1"])
class UserCRUDAPITestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin = User.objects.create_superuser(
            email="admin-crud@test.com",
            password="TestPass123!",
            first_name="Admin",
            last_name="CRUD",
        )
        admin_role = Role.objects.get(slug=Role.ADMIN)
        UserRole.objects.get_or_create(user=cls.admin, role=admin_role)

    def _auth_as_admin(self):
        login = self.client.post(
            "/api/users/token/",
            {"email": "admin-crud@test.com", "password": "TestPass123!"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")

    def test_admin_user_crud(self):
        self._auth_as_admin()

        create = self.client.post(
            "/api/users/users/",
            {
                "email": "receptionist@test.com",
                "first_name": "Recep",
                "last_name": "Tionist",
                "password": "TestPass123!",
                "password_confirm": "TestPass123!",
                "role_slug": "receptionist",
            },
            format="json",
        )
        self.assertEqual(create.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(email="receptionist@test.com")
        detail = self.client.get(f"/api/users/users/{user.id}/")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)

        update = self.client.patch(
            f"/api/users/users/{user.id}/",
            {"phone": "09170000000"},
            format="json",
        )
        self.assertEqual(update.status_code, status.HTTP_200_OK)
        self.assertEqual(update.data["phone"], "09170000000")

        delete = self.client.delete(f"/api/users/users/{user.id}/")
        self.assertEqual(delete.status_code, status.HTTP_204_NO_CONTENT)
        user.refresh_from_db()
        self.assertIsNotNone(user.deleted_at)
        self.assertFalse(user.is_active)

    def test_admin_can_create_dentist_via_api(self):
        self._auth_as_admin()
        response = self.client.post(
            "/api/users/users/",
            {
                "email": "dentist@test.com",
                "first_name": "Den",
                "last_name": "Tist",
                "password": "TestPass123!",
                "password_confirm": "TestPass123!",
                "role_slug": "dentist",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="dentist@test.com")
        self.assertIn("dentist", user.role_slugs)

    def test_admin_cannot_create_admin_via_api(self):
        self._auth_as_admin()
        response = self.client.post(
            "/api/users/users/",
            {
                "email": "fake-admin@test.com",
                "first_name": "Fake",
                "last_name": "Admin",
                "password": "TestPass123!",
                "password_confirm": "TestPass123!",
                "role_slug": "admin",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(email="fake-admin@test.com").exists())

    def test_list_users_is_paginated(self):
        self._auth_as_admin()
        response = self.client.get("/api/users/users/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        self.assertIn("count", response.data)
