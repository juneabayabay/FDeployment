from django.db import migrations

from users.permission_data import PERMISSIONS, ROLE_PERMISSIONS


def seed_permissions(apps, schema_editor):
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


def unseed_permissions(apps, schema_editor):
    ClinicPermission = apps.get_model("users", "ClinicPermission")
    codenames = [codename for codename, *_ in PERMISSIONS]
    ClinicPermission.objects.filter(codename__in=codenames).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0003_clinicpermission_rolepermission"),
    ]

    operations = [
        migrations.RunPython(seed_permissions, unseed_permissions),
    ]
