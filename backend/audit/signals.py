from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from appointments.models import Appointment, ClinicSetting
from billing.models import BillingRecord, DownPaymentRequest

from users.email_utils import SENSITIVE_SETTING_KEYS

from .models import AuditLog
from .services import log_audit

_appointment_original = {}


@receiver(pre_save, sender=Appointment)
def _store_appointment_original(sender, instance, **kwargs):
    if instance.pk:
        try:
            old = Appointment.objects.get(pk=instance.pk)
            _appointment_original[instance.pk] = {"status": old.status}
        except Appointment.DoesNotExist:
            pass


@receiver(post_save, sender=Appointment)
def _audit_appointment(sender, instance, created, **kwargs):
    if created:
        log_audit(
            action=AuditLog.Action.CREATE,
            module="appointments",
            resource_type="appointment",
            resource_id=instance.pk,
            summary=f"Appointment #{instance.pk} created for {instance.patient.email}",
        )
        return
    original = _appointment_original.pop(instance.pk, None)
    if original and original.get("status") != instance.status:
        log_audit(
            action=AuditLog.Action.UPDATE,
            module="appointments",
            resource_type="appointment",
            resource_id=instance.pk,
            summary=f"Appointment #{instance.pk} status → {instance.status}",
            changes={"status": {"from": original["status"], "to": instance.status}},
        )


@receiver(post_save, sender=BillingRecord)
def _audit_billing(sender, instance, created, **kwargs):
    action = AuditLog.Action.CREATE if created else AuditLog.Action.UPDATE
    log_audit(
        action=action,
        module="billing",
        resource_type="billing_record",
        resource_id=instance.pk,
        summary=f"Billing #{instance.pk} — {instance.payment_status}",
    )


@receiver(post_save, sender=ClinicSetting)
def _audit_setting(sender, instance, created, **kwargs):
    value = instance.value
    if instance.key in SENSITIVE_SETTING_KEYS:
        value = "[redacted]"
    log_audit(
        action=AuditLog.Action.CREATE if created else AuditLog.Action.UPDATE,
        module="settings",
        resource_type="clinic_setting",
        resource_id=instance.key,
        summary=f"Setting '{instance.key}' updated",
        changes={"value": value},
    )


@receiver(post_save, sender=DownPaymentRequest)
def _audit_down_payment(sender, instance, created, **kwargs):
    if created:
        log_audit(
            action=AuditLog.Action.CREATE,
            module="billing",
            resource_type="down_payment",
            resource_id=instance.pk,
            summary=f"Down payment request #{instance.pk} submitted",
        )
    elif instance.status == DownPaymentRequest.Status.APPROVED:
        log_audit(
            action=AuditLog.Action.APPROVE,
            module="billing",
            resource_type="down_payment",
            resource_id=instance.pk,
            summary=f"Down payment #{instance.pk} approved",
        )
    elif instance.status == DownPaymentRequest.Status.REJECTED:
        log_audit(
            action=AuditLog.Action.REJECT,
            module="billing",
            resource_type="down_payment",
            resource_id=instance.pk,
            summary=f"Down payment #{instance.pk} rejected",
        )
