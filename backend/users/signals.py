from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import DentistProfile, Role, UserRole


@receiver(post_save, sender=UserRole)
def ensure_dentist_profile(sender, instance, created, **kwargs):
    if instance.role.slug != Role.DENTIST:
        return
    DentistProfile.objects.get_or_create(user=instance.user)
