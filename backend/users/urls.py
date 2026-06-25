from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ChangePasswordView,
    ClinicPermissionViewSet,
    CurrentUserView,
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    ForgotPasswordView,
    LogoutView,
    RegisterView,
    ResetPasswordView,
    TestEmailView,
    RolePermissionViewSet,
    RoleViewSet,
    UserRoleViewSet,
    UserViewSet,
)

app_name = "users"

router = DefaultRouter()
router.register("roles", RoleViewSet, basename="role")
router.register("permissions", ClinicPermissionViewSet, basename="permission")
router.register("role-permissions", RolePermissionViewSet, basename="role-permission")
router.register("users", UserViewSet, basename="user")
router.register("user-roles", UserRoleViewSet, basename="user-role")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("token/", CustomTokenObtainPairView.as_view(), name="token-obtain"),
    path("token/refresh/", CustomTokenRefreshView.as_view(), name="token-refresh"),
    path("token/logout/", LogoutView.as_view(), name="token-logout"),
    path("me/", CurrentUserView.as_view(), name="me"),
    path("me/change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("password/forgot/", ForgotPasswordView.as_view(), name="password-forgot"),
    path("password/reset/", ResetPasswordView.as_view(), name="password-reset"),
    path("email/test/", TestEmailView.as_view(), name="email-test"),
    path("", include(router.urls)),
]
