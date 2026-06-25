from django.db import migrations

from users.permission_data import PERMISSIONS, ROLE_PERMISSIONS


def seed_new_permissions(apps, schema_editor):
    ClinicPermission = apps.get_model("users", "ClinicPermission")
    Role = apps.get_model("users", "Role")
    RolePermission = apps.get_model("users", "RolePermission")

    permission_map = {}
    for codename, name, module, action, description in PERMISSIONS:
        permission, _ = ClinicPermission.objects.get_or_create(
            codename=codename,
            defaults={
                "name": name,
                "module": module,
                "action": action,
                "description": description,
            },
        )
        permission_map[codename] = permission

    for role_slug, codenames in ROLE_PERMISSIONS.items():
        role = Role.objects.filter(slug=role_slug).first()
        if role is None:
            continue
        for codename in codenames:
            permission = permission_map.get(codename)
            if permission is None:
                continue
            RolePermission.objects.get_or_create(role=role, permission=permission)


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0004_seed_permissions"),
    ]

    operations = [
        migrations.RunPython(seed_new_permissions, migrations.RunPython.noop),
    ]
