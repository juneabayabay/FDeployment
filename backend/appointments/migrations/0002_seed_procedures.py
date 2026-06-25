from decimal import Decimal

from django.db import migrations


PROCEDURES = [
    {
        "name": "Cleaning",
        "slug": "cleaning",
        "duration_minutes": 60,
        "price": Decimal("1000.00"),
    },
    {
        "name": "Dental Filling",
        "slug": "dental-filling",
        "duration_minutes": 60,
        "price": Decimal("1000.00"),
    },
    {
        "name": "Extracting Tooth",
        "slug": "extracting-tooth",
        "duration_minutes": 60,
        "price": Decimal("1000.00"),
    },
    {
        "name": "Braces/Orthodontics",
        "slug": "braces-orthodontics",
        "duration_minutes": 180,
        "price": Decimal("50000.00"),
    },
]


def seed_procedures(apps, schema_editor):
    Procedure = apps.get_model("appointments", "Procedure")
    for proc in PROCEDURES:
        Procedure.objects.get_or_create(slug=proc["slug"], defaults=proc)


def unseed_procedures(apps, schema_editor):
    Procedure = apps.get_model("appointments", "Procedure")
    Procedure.objects.filter(
        slug__in=[p["slug"] for p in PROCEDURES]
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("appointments", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_procedures, unseed_procedures),
    ]
