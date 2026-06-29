from django.db import migrations


def grant_receptionist_staff_permissions(apps, schema_editor):
    Role = apps.get_model("users", "Role")
    ClinicPermission = apps.get_model("users", "ClinicPermission")
    RolePermission = apps.get_model("users", "RolePermission")

    role = Role.objects.filter(slug="receptionist").first()
    if role is None:
        return

    codenames = [
        "users.create",
        "users.update",
        "users.delete",
        "dentists.manage",
    ]
    for codename in codenames:
        permission = ClinicPermission.objects.filter(codename=codename).first()
        if permission:
            RolePermission.objects.get_or_create(role=role, permission=permission)


def revoke_receptionist_staff_permissions(apps, schema_editor):
    Role = apps.get_model("users", "Role")
    ClinicPermission = apps.get_model("users", "ClinicPermission")
    RolePermission = apps.get_model("users", "RolePermission")

    role = Role.objects.filter(slug="receptionist").first()
    if role is None:
        return

    codenames = [
        "users.create",
        "users.update",
        "users.delete",
        "dentists.manage",
    ]
    permissions = ClinicPermission.objects.filter(codename__in=codenames)
    RolePermission.objects.filter(role=role, permission__in=permissions).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0015_single_visible_dentist"),
    ]

    operations = [
        migrations.RunPython(
            grant_receptionist_staff_permissions,
            revoke_receptionist_staff_permissions,
        ),
    ]
