from django.db import migrations

from users.email_utils import SENSITIVE_SETTING_KEYS


def remove_smtp_settings(apps, schema_editor):
    ClinicSetting = apps.get_model("appointments", "ClinicSetting")
    ClinicSetting.objects.filter(key__in=list(SENSITIVE_SETTING_KEYS)).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("appointments", "0004_smtp_settings"),
    ]

    operations = [
        migrations.RunPython(remove_smtp_settings, migrations.RunPython.noop),
    ]
