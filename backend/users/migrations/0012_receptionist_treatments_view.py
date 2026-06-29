from django.db import migrations


def grant_receptionist_treatments_view(apps, schema_editor):
    Role = apps.get_model("users", "Role")
    ClinicPermission = apps.get_model("users", "ClinicPermission")
    RolePermission = apps.get_model("users", "RolePermission")

    role = Role.objects.filter(slug="receptionist").first()
    permission = ClinicPermission.objects.filter(codename="treatments.view").first()
    if role and permission:
        RolePermission.objects.get_or_create(role=role, permission=permission)


def revoke_receptionist_treatments_view(apps, schema_editor):
    Role = apps.get_model("users", "Role")
    ClinicPermission = apps.get_model("users", "ClinicPermission")
    RolePermission = apps.get_model("users", "RolePermission")

    role = Role.objects.filter(slug="receptionist").first()
    permission = ClinicPermission.objects.filter(codename="treatments.view").first()
    if role and permission:
        RolePermission.objects.filter(role=role, permission=permission).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0011_patientprofile"),
    ]

    operations = [
        migrations.RunPython(
            grant_receptionist_treatments_view,
            revoke_receptionist_treatments_view,
        ),
    ]
