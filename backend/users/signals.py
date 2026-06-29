from django.db.models.signals import post_save
from django.dispatch import receiver

from .dentist_directory import set_clinic_dentist
from .models import DentistProfile, PatientProfile, Role, UserRole


@receiver(post_save, sender=UserRole)
def ensure_dentist_profile(sender, instance, created, **kwargs):
    if instance.role.slug != Role.DENTIST:
        return
    profile, profile_created = DentistProfile.objects.get_or_create(user=instance.user)
    if created or profile_created:
        set_clinic_dentist(profile)


@receiver(post_save, sender=UserRole)
def ensure_patient_profile(sender, instance, created, **kwargs):
    if instance.role.slug != Role.USER:
        return
    PatientProfile.objects.get_or_create(user=instance.user)
