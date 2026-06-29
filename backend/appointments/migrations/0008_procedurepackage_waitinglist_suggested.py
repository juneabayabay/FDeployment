from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("appointments", "0007_appointment_booking_source"),
    ]

    operations = [
        migrations.CreateModel(
            name="ProcedurePackage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=150)),
                ("slug", models.SlugField(max_length=150, unique=True)),
                ("description", models.TextField(blank=True)),
                ("package_price", models.DecimalField(decimal_places=2, max_digits=10)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "procedures",
                    models.ManyToManyField(related_name="packages", to="appointments.procedure"),
                ),
            ],
            options={
                "db_table": "procedure_packages",
                "ordering": ["name"],
            },
        ),
        migrations.AddField(
            model_name="waitinglistentry",
            name="suggested_for_date",
            field=models.DateField(
                blank=True,
                help_text="Date of an open slot this entry is recommended for",
                null=True,
            ),
        ),
    ]
