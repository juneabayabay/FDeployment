from django.db import migrations, models
import django.db.models.deletion


def backfill_patient_profiles(apps, schema_editor):
    User = apps.get_model("users", "User")
    PatientProfile = apps.get_model("users", "PatientProfile")
    Role = apps.get_model("users", "Role")
    UserRole = apps.get_model("users", "UserRole")

    try:
        patient_role = Role.objects.get(slug="user")
    except Role.DoesNotExist:
        return

    patient_ids = UserRole.objects.filter(role=patient_role).values_list("user_id", flat=True)
    for user_id in patient_ids:
        PatientProfile.objects.get_or_create(user_id=user_id)


def remove_patient_profiles(apps, schema_editor):
    PatientProfile = apps.get_model("users", "PatientProfile")
    PatientProfile.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0010_dentist_profile_permissions"),
    ]

    operations = [
        migrations.CreateModel(
            name="PatientProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("date_of_birth", models.DateField(blank=True, null=True)),
                ("medical_history", models.TextField(blank=True)),
                ("allergies", models.TextField(blank=True)),
                ("emergency_contact_name", models.CharField(blank=True, max_length=150)),
                ("emergency_contact_phone", models.CharField(blank=True, max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="patient_profile",
                        to="users.user",
                    ),
                ),
            ],
            options={
                "db_table": "patient_profiles",
            },
        ),
        migrations.RunPython(backfill_patient_profiles, remove_patient_profiles),
    ]
