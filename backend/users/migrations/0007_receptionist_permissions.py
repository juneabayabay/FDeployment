from django.db import migrations

from users.permission_data import PERMISSIONS, ROLE_PERMISSIONS


def sync_receptionist_permissions(apps, schema_editor):
    Role = apps.get_model("users", "Role")
    ClinicPermission = apps.get_model("users", "ClinicPermission")
    RolePermission = apps.get_model("users", "RolePermission")

    permission_map = {
        p.codename: p
        for p in ClinicPermission.objects.filter(
            codename__in=[c for c, *_ in PERMISSIONS]
        )
    }

    role = Role.objects.filter(slug="receptionist").first()
    if not role:
        return

    RolePermission.objects.filter(role=role).delete()
    for codename in ROLE_PERMISSIONS["receptionist"]:
        permission = permission_map.get(codename)
        if permission:
            RolePermission.objects.create(role=role, permission=permission)


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0006_dentist_permissions"),
    ]

    operations = [
        migrations.RunPython(sync_receptionist_permissions, migrations.RunPython.noop),
    ]
