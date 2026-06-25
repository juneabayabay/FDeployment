from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Type(models.TextChoices):
        APPOINTMENT_CONFIRMED = "appointment_confirmed", "Appointment confirmed"
        APPOINTMENT_CANCELLED = "appointment_cancelled", "Appointment cancelled"
        APPOINTMENT_REMINDER = "appointment_reminder", "Appointment reminder"
        FOLLOW_UP_REMINDER = "follow_up_reminder", "Follow-up reminder"
        WAITING_LIST_SLOT = "waiting_list_slot", "Waiting list slot available"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    notification_type = models.CharField(max_length=40, choices=Type.choices)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    appointment = models.ForeignKey(
        "appointments.Appointment",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notifications",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} → {self.user.email}"
