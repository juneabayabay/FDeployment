import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives, get_connection

logger = logging.getLogger(__name__)

# Legacy keys — no longer used for credential storage (env vars only).
SMTP_USER_KEY = "smtp_gmail_user"
SMTP_PASSWORD_KEY = "smtp_gmail_app_password"

SENSITIVE_SETTING_KEYS = frozenset({SMTP_USER_KEY, SMTP_PASSWORD_KEY})


def get_smtp_credentials():
    """SMTP username/password from environment variables only."""
    user = (settings.EMAIL_HOST_USER or "").strip()
    password = (settings.EMAIL_HOST_PASSWORD or "").strip()
    return user, password


def get_from_email():
    user, _ = get_smtp_credentials()
    configured = (settings.DEFAULT_FROM_EMAIL or "").strip()
    if configured and configured != "noreply@barnabasdental.com":
        return configured
    return user or settings.DEFAULT_FROM_EMAIL


def is_console_email_backend():
    return settings.EMAIL_BACKEND.endswith("console.EmailBackend")


def is_smtp_ready():
    user, password = get_smtp_credentials()
    host = settings.EMAIL_HOST or "smtp.gmail.com"
    return bool(host and user and password)


def can_deliver_email():
    """True when Gmail SMTP is configured, or DEBUG + console backend (local dev)."""
    return is_smtp_ready() or (settings.DEBUG and is_console_email_backend())


def smtp_setup_hint():
    base = (
        "Gmail is not configured. In backend/.env set EMAIL_HOST_USER=your@gmail.com, "
        "EMAIL_HOST_PASSWORD=your-16-char-app-password, EMAIL_HOST=smtp.gmail.com, "
        "and EMAIL_USE_TLS=True. Create an App Password at "
        "https://myaccount.google.com/apppasswords (2-Step Verification required). "
        "Restart the backend, then run: python manage.py check_email your@gmail.com"
    )
    if settings.DEBUG:
        return (
            f"{base} "
            "For local dev without Gmail, set EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend "
            "in backend/.env — verification links will print in this terminal."
        )
    return base


def get_email_connection():
    user, password = get_smtp_credentials()
    return get_connection(
        backend="django.core.mail.backends.smtp.EmailBackend",
        host=settings.EMAIL_HOST or "smtp.gmail.com",
        port=settings.EMAIL_PORT,
        username=user,
        password=password,
        use_tls=settings.EMAIL_USE_TLS,
        use_ssl=settings.EMAIL_USE_SSL,
        timeout=settings.EMAIL_TIMEOUT,
    )


def send_clinic_email(*, subject, text_body, html_body=None, recipient):
    """Send a clinic email. Uses Gmail SMTP or console backend in DEBUG."""
    if not can_deliver_email():
        return False, smtp_setup_hint()

    try:
        from_email = get_from_email()
        if is_smtp_ready():
            connection = get_email_connection()
        else:
            connection = get_connection()

        if html_body:
            message = EmailMultiAlternatives(
                subject=subject,
                body=text_body,
                from_email=from_email,
                to=[recipient],
                connection=connection,
            )
            message.attach_alternative(html_body, "text/html")
            sent = message.send(fail_silently=False)
        else:
            from django.core.mail import EmailMessage

            message = EmailMessage(
                subject=subject,
                body=text_body,
                from_email=from_email,
                to=[recipient],
                connection=connection,
            )
            sent = message.send(fail_silently=False)

        if sent < 1:
            logger.error("Clinic email not sent to %s", recipient)
            return False, "Email backend returned no sent messages."
        if not is_smtp_ready():
            logger.info(
                "Dev console email for %s — open the runserver terminal to copy the verification link.",
                recipient,
            )
        return True, None
    except Exception as exc:
        logger.exception("Failed to send clinic email to %s", recipient)
        return False, str(exc)


def send_password_reset_email(*, subject, text_body, html_body, recipient):
    """Send a password reset confirmation email (plain text + HTML)."""
    return send_clinic_email(
        subject=subject,
        text_body=text_body,
        html_body=html_body,
        recipient=recipient,
    )
