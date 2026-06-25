from django.conf import settings
from django.db import models


class TreatmentRecord(models.Model):
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="treatment_records",
    )
    title = models.CharField(max_length=200)
    notes = models.TextField(blank=True)
    treatment_date = models.DateField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="treatments_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "treatment_records"
        ordering = ["-treatment_date", "-created_at"]


class OrthodonticRecord(models.Model):
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orthodontic_records",
    )
    phase = models.CharField(max_length=100, blank=True)
    progress_notes = models.TextField(blank=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orthodontic_updates",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "orthodontic_records"
        ordering = ["-updated_at"]


class SurgicalRecord(models.Model):
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="surgical_records",
    )
    procedure_name = models.CharField(max_length=200)
    notes = models.TextField(blank=True)
    surgery_date = models.DateField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="surgical_records_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "surgical_records"
        ordering = ["-surgery_date", "-created_at"]
