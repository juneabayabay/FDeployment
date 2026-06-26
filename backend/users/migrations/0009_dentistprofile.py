from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0008_user_avatar"),
    ]

    operations = [
        migrations.CreateModel(
            name="DentistProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(blank=True, default="Dr.", max_length=100)),
                ("specialization", models.CharField(blank=True, max_length=150)),
                ("years_experience", models.PositiveSmallIntegerField(default=0)),
                ("bio", models.TextField(blank=True)),
                (
                    "schedule_summary",
                    models.CharField(
                        blank=True,
                        help_text="Short schedule text, e.g. Mon–Fri 9:00 AM – 5:00 PM",
                        max_length=255,
                    ),
                ),
                (
                    "is_visible",
                    models.BooleanField(
                        default=True,
                        help_text="Show this dentist in the patient-facing directory",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="dentist_profile",
                        to="users.user",
                    ),
                ),
            ],
            options={
                "db_table": "dentist_profiles",
                "ordering": ["user__last_name", "user__first_name"],
            },
        ),
    ]
