import logging
import sys

from django.apps import AppConfig

logger = logging.getLogger(__name__)


class UsersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "users"

    def ready(self):
        import users.signals  # noqa: F401

        if any(cmd in sys.argv for cmd in ("migrate", "makemigrations", "test", "check_email", "sendtestemail")):
            return

        from django.conf import settings

        from users.email_utils import is_smtp_ready, smtp_setup_hint

        if not is_smtp_ready() and not settings.EMAIL_BACKEND.endswith("console.EmailBackend"):
            logger.warning("EMAIL: %s", smtp_setup_hint())
