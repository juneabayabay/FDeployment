import uuid

WALK_IN_EMAIL_DOMAIN = "patients.barnabas.local"


def is_walk_in_placeholder_email(email: str) -> bool:
    if not email:
        return False
    return email.lower().endswith(f"@{WALK_IN_EMAIL_DOMAIN}")


def generate_walk_in_email() -> str:
    from .models import User

    while True:
        email = f"walkin-{uuid.uuid4().hex}@{WALK_IN_EMAIL_DOMAIN}"
        if not User.objects.filter(email__iexact=email).exists():
            return email
