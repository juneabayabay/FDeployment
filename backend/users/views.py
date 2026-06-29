from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.tokens import default_token_generator
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import ClinicPermission, Role, RolePermission, User, UserRole
from .permissions import HasClinicPermission
from .staff_management import assert_actor_can_manage_target
from .serializers import (
    ChangePasswordSerializer,
    ClinicPermissionSerializer,
    CustomTokenObtainPairSerializer,
    ForgotPasswordSerializer,
    PublicRegisterSerializer,
    ResendVerificationSerializer,
    ResetPasswordSerializer,
    RolePermissionSerializer,
    RoleSerializer,
    UserCreateSerializer,
    UserRoleSerializer,
    UserSerializer,
    UserUpdateSerializer,
    VerifyEmailSerializer,
)
from .email_templates import build_password_reset_email
from .email_verification import send_email_verification
from .patient_account import patient_must_verify_email
from .throttles import AuthAnonRateThrottle
from .email_utils import can_deliver_email, is_smtp_ready, send_password_reset_email, smtp_setup_hint
from .utils import blacklist_user_tokens
from .avatar import delete_stored_avatar, validate_avatar_file


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.filter(deleted_at__isnull=True)
    serializer_class = PublicRegisterSerializer
    permission_classes = [AllowAny]
    throttle_classes = [AuthAnonRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        sent, error = send_email_verification(user)
        response_data = UserSerializer(user, context={"request": request}).data
        if sent:
            response_data["message"] = (
                "Account created. Please check your email to verify your address before booking."
            )
        elif settings.DEBUG and error:
            response_data["message"] = (
                "Account created. Email verification could not be sent — "
                f"check the backend console or configure SMTP. ({error})"
            )
        else:
            response_data["message"] = (
                "Account created. We could not send a verification email right now — "
                "use Resend verification after signing in."
            )

        return Response(response_data, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]
    throttle_classes = [AuthAnonRateThrottle]


class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthAnonRateThrottle]


class LogoutView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthAnonRateThrottle]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"detail": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            RefreshToken(refresh_token).blacklist()
        except TokenError:
            return Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)


class CurrentUserView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return UserUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        blacklist_user_tokens(request.user)

        return Response({"detail": "Password updated successfully."})


class CurrentUserAvatarView(APIView):
    """Upload or remove the authenticated user's profile picture."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        uploaded = request.FILES.get("avatar")
        if not uploaded:
            return Response(
                {"avatar": ["No file was submitted."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            validate_avatar_file(uploaded)
        except DjangoValidationError as exc:
            return Response(
                {"avatar": exc.messages},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user
        delete_stored_avatar(user)
        user.avatar = uploaded
        user.avatar_url = ""
        user.save(update_fields=["avatar", "avatar_url", "updated_at"])

        return Response(
            UserSerializer(user, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request):
        user = request.user
        delete_stored_avatar(user)
        user.avatar = None
        user.avatar_url = ""
        user.save(update_fields=["avatar", "avatar_url", "updated_at"])

        return Response(
            UserSerializer(user, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthAnonRateThrottle]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        response_data = {
            "detail": (
                "If an account exists with that email, a confirmation message has been sent to your inbox. "
                "Open Gmail and click the link only if you requested a password reset."
            ),
        }

        try:
            user = User.objects.get(email=email, deleted_at__isnull=True, is_active=True)
        except User.DoesNotExist:
            return Response(response_data)

        if not can_deliver_email():
            detail = (
                smtp_setup_hint()
                if settings.DEBUG
                else (
                    "Unable to send confirmation email right now. "
                    "Please contact the clinic administrator."
                )
            )
            return Response(
                {"detail": detail, "code": "smtp_not_configured"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
        reset_link = f"{frontend_url}/reset-password?uid={uid}&token={token}"

        subject, text_body, html_body = build_password_reset_email(
            recipient_email=user.email,
            recipient_name=user.full_name or user.get_full_name() or user.first_name,
            reset_link=reset_link,
        )

        sent, error = send_password_reset_email(
            subject=subject,
            text_body=text_body,
            html_body=html_body,
            recipient=user.email,
        )

        if not sent:
            detail = (
                f"Unable to send confirmation email: {error}"
                if settings.DEBUG and error
                else (
                    "Unable to send confirmation email right now. "
                    "Please try again later or contact the clinic."
                )
            )
            return Response(
                {"detail": detail, "code": "smtp_send_failed"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(response_data)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthAnonRateThrottle]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            uid = force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
            user = User.objects.get(pk=uid, deleted_at__isnull=True, is_active=True)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response(
                {"detail": "Invalid reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token = serializer.validated_data["token"]
        if not default_token_generator.check_token(user, token):
            return Response(
                {"detail": "Invalid or expired reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        blacklist_user_tokens(user)

        return Response({"detail": "Password reset successful. You can now log in."})


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthAnonRateThrottle]

    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            uid = force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
            user = User.objects.get(pk=uid, deleted_at__isnull=True, is_active=True)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response(
                {"detail": "Invalid verification link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token = serializer.validated_data["token"]
        if not default_token_generator.check_token(user, token):
            return Response(
                {"detail": "Invalid or expired verification link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.email_verified_at:
            return Response({"detail": "Email is already verified."})

        user.email_verified_at = timezone.now()
        user.save(update_fields=["email_verified_at", "updated_at"])
        return Response({"detail": "Email verified successfully. You can now book appointments."})


class ResendVerificationView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthAnonRateThrottle]

    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        response_data = {
            "detail": (
                "If an account exists and still needs verification, a new email has been sent."
            ),
        }

        if request.user.is_authenticated:
            user = request.user
        else:
            email = (serializer.validated_data.get("email") or "").strip()
            if not email:
                return Response(
                    {"email": ["Email is required when not signed in."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user = User.objects.filter(
                email__iexact=email, deleted_at__isnull=True, is_active=True
            ).first()
            if not user:
                return Response(response_data)

        if not patient_must_verify_email(user):
            return Response(response_data)

        sent, error = send_email_verification(user)
        if not sent:
            detail = (
                f"Unable to send verification email: {error}"
                if settings.DEBUG and error
                else "Unable to send verification email right now. Please try again later."
            )
            return Response(
                {"detail": detail, "code": "smtp_send_failed"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(response_data)


class TestEmailView(APIView):
    """DEBUG-only SMTP test for admins. POST { \"email\": \"optional@recipient.com\" }"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not settings.DEBUG:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if not request.user.is_superuser:
            return Response(status=status.HTTP_403_FORBIDDEN)
        if not can_deliver_email():
            return Response({"detail": smtp_setup_hint()}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        from .email_utils import send_clinic_email

        recipient = request.data.get("email") or settings.EMAIL_HOST_USER
        sent, error = send_clinic_email(
            subject="Barnabas Dental — SMTP test",
            text_body="If you receive this in Gmail, SMTP is configured correctly.",
            recipient=recipient,
        )
        if not sent:
            return Response(
                {"detail": error or "Unable to send test email."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response({"detail": f"Test email sent to {recipient}."})


class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Role.objects.prefetch_related(
        "role_permissions__permission"
    ).order_by("name")
    serializer_class = RoleSerializer
    permission_classes = [HasClinicPermission]
    required_permissions = ["roles.view"]


class ClinicPermissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ClinicPermission.objects.all().order_by("module", "action")
    serializer_class = ClinicPermissionSerializer
    permission_classes = [HasClinicPermission]
    required_permissions = ["permissions.view"]


class RolePermissionViewSet(viewsets.ModelViewSet):
    queryset = RolePermission.objects.select_related(
        "role", "permission"
    ).order_by("role__name", "permission__codename")
    serializer_class = RolePermissionSerializer
    permission_classes = [HasClinicPermission]
    required_permissions = ["permissions.manage"]


class UserViewSet(viewsets.ModelViewSet):
    queryset = (
        User.objects.filter(deleted_at__isnull=True)
        .prefetch_related("user_roles__role")
        .order_by("-created_at")
    )
    permission_classes = [HasClinicPermission]
    permission_map = {
        "list": ["users.view"],
        "retrieve": ["users.view"],
        "create": ["users.create"],
        "update": ["users.update"],
        "partial_update": ["users.update"],
        "destroy": ["users.delete"],
        "reset_password": ["users.update"],
    }

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        if self.action in ("update", "partial_update"):
            return UserUpdateSerializer
        return UserSerializer

    def _guard_staff_management(self, target):
        assert_actor_can_manage_target(self.request.user, target)

    def perform_update(self, serializer):
        self._guard_staff_management(serializer.instance)
        serializer.save()

    def perform_destroy(self, instance):
        self._guard_staff_management(instance)
        instance.soft_delete()
        blacklist_user_tokens(instance)

    @action(detail=True, methods=["post"], url_path="reset-password")
    def reset_password(self, request, pk=None):
        user = self.get_object()
        self._guard_staff_management(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
        reset_link = f"{frontend_url}/reset-password?uid={uid}&token={token}"

        subject, text_body, html_body = build_password_reset_email(
            recipient_email=user.email,
            recipient_name=user.full_name or user.get_full_name() or user.first_name,
            reset_link=reset_link,
            initiated_by_admin=True,
        )

        sent, _error = send_password_reset_email(
            subject=subject,
            text_body=text_body,
            html_body=html_body,
            recipient=user.email,
        )

        from audit.services import client_ip, log_audit
        from audit.models import AuditLog

        log_audit(
            actor=request.user,
            action=AuditLog.Action.UPDATE,
            module="users",
            resource_type="user",
            resource_id=user.pk,
            summary=f"Password reset initiated for {user.email}",
            ip_address=client_ip(request),
        )

        if not sent:
            return Response(
                {"detail": "Unable to send confirmation email. Try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response({"detail": "Password reset confirmation email sent."})


class UserRoleViewSet(viewsets.ModelViewSet):
    queryset = UserRole.objects.select_related("user", "role", "assigned_by").order_by(
        "-assigned_at"
    )
    serializer_class = UserRoleSerializer
    permission_classes = [HasClinicPermission]
    permission_map = {
        "list": ["user_roles.view"],
        "retrieve": ["user_roles.view"],
        "create": ["user_roles.manage"],
        "update": ["user_roles.manage"],
        "partial_update": ["user_roles.manage"],
        "destroy": ["user_roles.manage"],
    }

    def perform_create(self, serializer):
        serializer.save(assigned_by=self.request.user)
