from datetime import timedelta
from decimal import Decimal

from django.conf import settings
from django.db import models
from django.utils import timezone


class ClinicSetting(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "clinic_settings"

    def __str__(self):
        return self.key


class Procedure(models.Model):
    class Category(models.TextChoices):
        MINOR = "minor", "Minor (30 min – 1 hr)"
        ORTHODONTIC = "orthodontic", "Orthodontic adjustment (45 min – 1 hr)"
        MAJOR = "major", "Major (1 – 3 hrs)"

    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150, unique=True)
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.MINOR,
    )
    duration_minutes = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "procedures"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Appointment(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PENCIL_BOOKED = "pencil_booked", "Pencil Booked"
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"
        COMPLETED = "completed", "Completed"
        NO_SHOW = "no_show", "No Show"

    class BookingType(models.TextChoices):
        PAID = "paid", "Book Now (Pay)"
        PENCIL = "pencil", "Pencil Booking (4 hrs)"

    ACTIVE_STATUSES = (
        Status.PENDING,
        Status.PENCIL_BOOKED,
        Status.CONFIRMED,
    )

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="appointments",
    )
    appointment_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENCIL_BOOKED,
    )
    booking_type = models.CharField(
        max_length=20,
        choices=BookingType.choices,
        default=BookingType.PENCIL,
    )
    procedures = models.ManyToManyField(Procedure, related_name="appointments")
    total_duration_minutes = models.PositiveIntegerField(default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    pencil_expires_at = models.DateTimeField(null=True, blank=True)
    cancellation_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "appointments"
        ordering = ["-appointment_date", "-start_time"]
        indexes = [
            models.Index(fields=["appointment_date", "start_time"]),
            models.Index(fields=["patient", "status"]),
        ]

    def __str__(self):
        return f"{self.patient.email} — {self.appointment_date} {self.start_time}"

    @property
    def is_active(self):
        return self.status in self.ACTIVE_STATUSES

    def set_pencil_expiry(self):
        from .clinic_config import get_pencil_booking_hours

        self.pencil_expires_at = timezone.now() + timedelta(
            hours=get_pencil_booking_hours()
        )

    def expire_pencil_if_needed(self):
        if (
            self.status == self.Status.PENCIL_BOOKED
            and self.pencil_expires_at
            and timezone.now() >= self.pencil_expires_at
        ):
            self.status = self.Status.CANCELLED
            self.save(update_fields=["status", "updated_at"])
            return True
        return False


class WaitingListEntry(models.Model):
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="waiting_list_entries",
    )
    preferred_date = models.DateField(null=True, blank=True)
    procedures = models.ManyToManyField(Procedure, related_name="waiting_list_entries")
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "waiting_list_entries"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Waiting: {self.patient.email}"
