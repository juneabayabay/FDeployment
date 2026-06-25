from decimal import Decimal

from django.conf import settings
from django.db import models


class BillingRecord(models.Model):
    class PaymentStatus(models.TextChoices):
        UNPAID = "unpaid", "Unpaid"
        PARTIAL = "partial", "Partial"
        PAID = "paid", "Paid"

    class PaymentMethod(models.TextChoices):
        CASH = "cash", "Cash"
        GCASH = "gcash", "GCash"
        OTHER = "other", "Other"

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="billing_records",
    )
    appointment = models.OneToOneField(
        "appointments.Appointment",
        on_delete=models.CASCADE,
        related_name="billing",
        null=True,
        blank=True,
    )
    description = models.CharField(max_length=255, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        blank=True,
        default="",
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.UNPAID,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "billing_records"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Bill #{self.id} — {self.patient.email}"

    @property
    def balance(self):
        return max(Decimal("0"), self.total_amount - self.amount_paid)

    def update_payment_status(self):
        if self.amount_paid >= self.total_amount:
            self.payment_status = self.PaymentStatus.PAID
        elif self.amount_paid > 0:
            self.payment_status = self.PaymentStatus.PARTIAL
        else:
            self.payment_status = self.PaymentStatus.UNPAID

    def save(self, *args, **kwargs):
        self.update_payment_status()
        super().save(*args, **kwargs)


class DownPaymentRequest(models.Model):
    """Braces / orthodontic down payment approval workflow."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="down_payment_requests",
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_down_payments",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    billing_record = models.ForeignKey(
        BillingRecord,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="down_payment_request",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "down_payment_requests"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Down payment #{self.id} — {self.patient.email} ({self.status})"
