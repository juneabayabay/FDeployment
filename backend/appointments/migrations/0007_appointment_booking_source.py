from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("appointments", "0006_appointment_dentist"),
    ]

    operations = [
        migrations.AddField(
            model_name="appointment",
            name="booking_source",
            field=models.CharField(
                choices=[
                    ("online", "Online"),
                    ("walk_in", "Walk-in"),
                    ("emergency", "Emergency"),
                ],
                default="online",
                max_length=20,
            ),
        ),
    ]
