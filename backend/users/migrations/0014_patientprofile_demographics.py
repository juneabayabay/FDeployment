from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0013_patientprofile_is_walk_in_account"),
    ]

    operations = [
        migrations.AddField(
            model_name="patientprofile",
            name="address",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="patientprofile",
            name="sex",
            field=models.CharField(
                blank=True,
                choices=[
                    ("male", "Male"),
                    ("female", "Female"),
                    ("other", "Other"),
                    ("prefer_not_to_say", "Prefer not to say"),
                ],
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="patientprofile",
            name="civil_status",
            field=models.CharField(
                blank=True,
                choices=[
                    ("single", "Single"),
                    ("married", "Married"),
                    ("widowed", "Widowed"),
                    ("separated", "Separated"),
                    ("divorced", "Divorced"),
                    ("prefer_not_to_say", "Prefer not to say"),
                ],
                max_length=20,
            ),
        ),
    ]
