from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("clinical", "0001_phase2"),
    ]

    operations = [
        migrations.CreateModel(
            name="PrescriptionRecord",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("medication", models.CharField(max_length=200)),
                ("dosage", models.CharField(max_length=100)),
                ("instructions", models.TextField(blank=True)),
                ("prescribed_date", models.DateField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "patient",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="prescription_records",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "prescribed_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="prescriptions_written",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "prescription_records",
                "ordering": ["-prescribed_date", "-created_at"],
            },
        ),
    ]
