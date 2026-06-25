from django.conf import settings
from django.core.mail import send_mail
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Send a test email to verify SMTP configuration"

    def add_arguments(self, parser):
        parser.add_argument(
            "recipient",
            nargs="?",
            default=settings.EMAIL_HOST_USER,
            help="Recipient email (defaults to EMAIL_HOST_USER)",
        )

    def handle(self, *args, **options):
        recipient = options["recipient"]
        if not recipient:
            self.stderr.write(
                self.style.ERROR(
                    "No recipient. Set EMAIL_HOST_USER in .env or pass an email address."
                )
            )
            return

        self.stdout.write(f"Backend: {settings.EMAIL_BACKEND}")
        self.stdout.write(f"Host: {settings.EMAIL_HOST or '(none)'}:{settings.EMAIL_PORT}")
        self.stdout.write(f"From: {settings.DEFAULT_FROM_EMAIL}")
        self.stdout.write(f"To: {recipient}")

        if settings.EMAIL_BACKEND.endswith("console.EmailBackend"):
            self.stdout.write(
                self.style.WARNING(
                    "Using console backend — email will print below, not reach Gmail."
                )
            )

        try:
            sent = send_mail(
                subject="Barnabas Dental — SMTP test",
                message="If you receive this, SMTP is configured correctly.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                fail_silently=False,
            )
            self.stdout.write(
                self.style.SUCCESS(f"Sent {sent} message(s). Check inbox/spam.")
            )
        except Exception as exc:
            self.stderr.write(self.style.ERROR(f"FAIL: {exc}"))
            raise
