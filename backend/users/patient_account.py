from .models import PatientProfile
from .walk_in import is_walk_in_placeholder_email


def get_patient_profile(user):
    try:
        return user.patient_profile
    except PatientProfile.DoesNotExist:
        return None


def patient_must_verify_email(user) -> bool:
    """Online patients need a verified email before booking; walk-ins are exempt."""
    if not user.is_patient_user:
        return False
    profile = get_patient_profile(user)
    if profile and profile.is_walk_in_account:
        return False
    if is_walk_in_placeholder_email(user.email):
        return False
    return user.email_verified_at is None
