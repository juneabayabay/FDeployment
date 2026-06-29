from .models import DentistProfile, Role


def set_clinic_dentist(profile):
    """Single-dentist clinic: one visible dentist for patients; others are hidden."""
    profile.is_visible = True
    profile.save(update_fields=["is_visible", "updated_at"])
    DentistProfile.objects.exclude(pk=profile.pk).filter(
        user__deleted_at__isnull=True,
        user__is_active=True,
        user__user_roles__role__slug=Role.DENTIST,
    ).update(is_visible=False)
