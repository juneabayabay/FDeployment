from django.db import migrations, models


def migrate_pencil_status(apps, schema_editor):
    Appointment = apps.get_model("appointments", "Appointment")
    Appointment.objects.filter(status="pencil").update(status="pencil_booked")


def reverse_pencil_status(apps, schema_editor):
    Appointment = apps.get_model("appointments", "Appointment")
    Appointment.objects.filter(status="pencil_booked").update(status="pencil")


SETTINGS = [
    ("pencil_booking_hours", "4", "Hours before pencil booking expires"),
    ("max_daily_patients", "10", "Maximum patients per day"),
    ("cancellation_window_hours", "24", "Hours before appointment when cancellation fee applies"),
    ("no_show_fee", "300", "Fee for late cancellation / no-show (PHP)"),
]


def seed_settings(apps, schema_editor):
    ClinicSetting = apps.get_model("appointments", "ClinicSetting")
    for key, value, desc in SETTINGS:
        ClinicSetting.objects.get_or_create(
            key=key,
            defaults={"value": value, "description": desc},
        )


def unseed_settings(apps, schema_editor):
    ClinicSetting = apps.get_model("appointments", "ClinicSetting")
    ClinicSetting.objects.filter(key__in=[s[0] for s in SETTINGS]).delete()


PROCEDURE_CATEGORIES = {
    "cleaning": "minor",
    "dental-filling": "minor",
    "extracting-tooth": "major",
    "braces-orthodontics": "major",
}


def set_procedure_categories(apps, schema_editor):
    Procedure = apps.get_model("appointments", "Procedure")
    for slug, category in PROCEDURE_CATEGORIES.items():
        Procedure.objects.filter(slug=slug).update(category=category)


class Migration(migrations.Migration):
    dependencies = [
        ("appointments", "0002_seed_procedures"),
    ]

    operations = [
        migrations.CreateModel(
            name="ClinicSetting",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("key", models.CharField(max_length=100, unique=True)),
                ("value", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"db_table": "clinic_settings"},
        ),
        migrations.AddField(
            model_name="procedure",
            name="category",
            field=models.CharField(
                choices=[
                    ("minor", "Minor (30 min – 1 hr)"),
                    ("orthodontic", "Orthodontic adjustment (45 min – 1 hr)"),
                    ("major", "Major (1 – 3 hrs)"),
                ],
                default="minor",
                max_length=20,
            ),
        ),
        migrations.RunPython(migrate_pencil_status, reverse_pencil_status),
        migrations.AlterField(
            model_name="appointment",
            name="status",
            field=models.CharField(
                choices=[
                    ("pending", "Pending"),
                    ("pencil_booked", "Pencil Booked"),
                    ("confirmed", "Confirmed"),
                    ("cancelled", "Cancelled"),
                    ("completed", "Completed"),
                    ("no_show", "No Show"),
                ],
                default="pencil_booked",
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name="appointment",
            name="booking_type",
            field=models.CharField(
                choices=[
                    ("paid", "Book Now (Pay)"),
                    ("pencil", "Pencil Booking (4 hrs)"),
                ],
                default="pencil",
                max_length=20,
            ),
        ),
        migrations.RunPython(seed_settings, unseed_settings),
        migrations.RunPython(set_procedure_categories, migrations.RunPython.noop),
    ]
