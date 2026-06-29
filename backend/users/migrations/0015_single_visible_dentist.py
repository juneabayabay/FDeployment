from django.db import migrations


def keep_latest_visible_dentist(apps, schema_editor):
    DentistProfile = apps.get_model("users", "DentistProfile")
    profiles = list(
        DentistProfile.objects.filter(is_visible=True).order_by("-created_at", "-id")
    )
    if len(profiles) <= 1:
        return
    primary = profiles[0]
    DentistProfile.objects.exclude(pk=primary.pk).update(is_visible=False)


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0014_patientprofile_demographics"),
    ]

    operations = [
        migrations.RunPython(keep_latest_visible_dentist, migrations.RunPython.noop),
    ]
