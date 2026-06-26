from django.db import migrations

from users.permission_data import PERMISSIONS, ROLE_PERMISSIONS


def seed_dentist_permissions(apps, schema_editor):
    ClinicPermission = apps.get_model("users", "ClinicPermission")
    Role = apps.get_model("users", "Role")
    RolePermission = apps.get_model("users", "RolePermission")

    permission_map = {}
    for codename, name, module, action, description in PERMISSIONS:
        perm, _ = ClinicPermission.objects.update_or_create(
            codename=codename,
            defaults={
                "name": name,
                "module": module,
                "action": action,
                "description": description,
            },
        )
        permission_map[codename] = perm

    for slug, codenames in ROLE_PERMISSIONS.items():
        role = Role.objects.filter(slug=slug).first()
        if not role:
            continue
        if slug == "admin":
            for codename in codenames:
                permission = permission_map.get(codename)
                if permission:
                    RolePermission.objects.get_or_create(role=role, permission=permission)
            continue
        RolePermission.objects.filter(role=role).delete()
        for codename in codenames:
            permission = permission_map.get(codename)
            if permission:
                RolePermission.objects.get_or_create(role=role, permission=permission)


def backfill_dentist_profiles(apps, schema_editor):
    User = apps.get_model("users", "User")
    UserRole = apps.get_model("users", "UserRole")
    DentistProfile = apps.get_model("users", "DentistProfile")
    Role = apps.get_model("users", "Role")

    dentist_role = Role.objects.filter(slug="dentist").first()
    if not dentist_role:
        return

    dentist_user_ids = UserRole.objects.filter(role=dentist_role).values_list(
        "user_id", flat=True
    )
    for user_id in dentist_user_ids:
        DentistProfile.objects.get_or_create(user_id=user_id)


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0009_dentistprofile"),
    ]

    operations = [
        migrations.RunPython(seed_dentist_permissions, migrations.RunPython.noop),
        migrations.RunPython(backfill_dentist_profiles, migrations.RunPython.noop),
    ]
