from django.db import migrations

SMTP_SETTINGS = [
    (
        "smtp_gmail_user",
        "",
        "Gmail address used to send clinic emails (e.g. abayabayytchannel@gmail.com)",
    ),
    (
        "smtp_gmail_app_password",
        "",
        "16-character Google App Password for Gmail SMTP (not your login password)",
    ),
]


def seed_smtp_settings(apps, schema_editor):
    ClinicSetting = apps.get_model("appointments", "ClinicSetting")
    for key, value, description in SMTP_SETTINGS:
        ClinicSetting.objects.get_or_create(
            key=key,
            defaults={"value": value, "description": description},
        )


def remove_smtp_settings(apps, schema_editor):
    ClinicSetting = apps.get_model("appointments", "ClinicSetting")
    ClinicSetting.objects.filter(key__in=[s[0] for s in SMTP_SETTINGS]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("appointments", "0003_clinic_settings_and_statuses"),
    ]

    operations = [
        migrations.RunPython(seed_smtp_settings, remove_smtp_settings),
    ]
