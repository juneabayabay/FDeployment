from django.db import migrations


def seed_roles(apps, schema_editor):
    Role = apps.get_model("users", "Role")
    roles = [
        {
            "slug": "admin",
            "name": "Administrator",
            "description": "Full system access and user management.",
            "is_system_role": True,
        },
        {
            "slug": "dentist",
            "name": "Dentist",
            "description": "Clinical access to patients, appointments, and treatments.",
            "is_system_role": True,
        },
        {
            "slug": "receptionist",
            "name": "Receptionist",
            "description": "Front desk access for booking and patient registration.",
            "is_system_role": True,
        },
        {
            "slug": "user",
            "name": "User",
            "description": "Patient portal access to own records and appointments.",
            "is_system_role": True,
        },
    ]
    for role_data in roles:
        Role.objects.get_or_create(slug=role_data["slug"], defaults=role_data)


def unseed_roles(apps, schema_editor):
    Role = apps.get_model("users", "Role")
    Role.objects.filter(
        slug__in=["admin", "dentist", "receptionist", "user"],
        is_system_role=True,
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_roles, unseed_roles),
    ]
