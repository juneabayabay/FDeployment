from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from .email_templates import build_email_verification_email
from .email_utils import send_clinic_email
from .patient_account import patient_must_verify_email


def build_verification_link(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    return f"{frontend_url}/verify-email?uid={uid}&token={token}"


def send_email_verification(user):
    """Send verification email to an online patient. Returns (success, error_message)."""
    if not patient_must_verify_email(user):
        return True, None

    verify_link = build_verification_link(user)
    subject, text_body, html_body = build_email_verification_email(
        recipient_email=user.email,
        recipient_name=user.full_name or user.first_name,
        verify_link=verify_link,
    )
    return send_clinic_email(
        subject=subject,
        text_body=text_body,
        html_body=html_body,
        recipient=user.email,
    )
