from django.conf import settings
from django.core.management.base import BaseCommand

from users.email_utils import get_smtp_credentials, is_smtp_ready, send_clinic_email, smtp_setup_hint


class Command(BaseCommand):
    help = "Verify Gmail/SMTP configuration for password reset emails"

    def add_arguments(self, parser):
        parser.add_argument(
            "recipient",
            nargs="?",
            help="Email to send a test message to",
        )

    def handle(self, *args, **options):
        user, password = get_smtp_credentials()
        self.stdout.write(f"EMAIL_BACKEND = {settings.EMAIL_BACKEND}")
        self.stdout.write(f"EMAIL_HOST = {settings.EMAIL_HOST or 'smtp.gmail.com'}")
        self.stdout.write(f"SMTP user = {user or '(empty)'}")
        self.stdout.write(f"SMTP password = {'(set)' if password else '(MISSING)'}")
        self.stdout.write(f"FROM = {user or settings.DEFAULT_FROM_EMAIL}")

        if not is_smtp_ready():
            self.stderr.write(self.style.ERROR("FAIL — SMTP is not ready."))
            self.stderr.write(self.style.WARNING(smtp_setup_hint()))
            return

        recipient = options["recipient"] or user
        if not recipient:
            self.stderr.write(self.style.ERROR("Provide a recipient email to test delivery."))
            return

        self.stdout.write(f"Sending test email to {recipient} ...")

        sent, error = send_clinic_email(
            subject="Barnabas Dental — email test",
            text_body="If you see this in Gmail, password reset emails will work.",
            recipient=recipient,
        )
        if sent:
            self.stdout.write(
                self.style.SUCCESS(f"PASS — sent to {recipient}. Check inbox and spam.")
            )
        else:
            self.stderr.write(self.style.ERROR(f"FAIL — {error}"))
            self.stderr.write(self.style.WARNING(smtp_setup_hint()))
