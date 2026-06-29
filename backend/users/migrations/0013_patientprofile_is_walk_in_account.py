# Generated manually for walk-in patient accounts

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0012_receptionist_treatments_view"),
    ]

    operations = [
        migrations.AddField(
            model_name="patientprofile",
            name="is_walk_in_account",
            field=models.BooleanField(
                default=False,
                help_text="Created by staff at the front desk; no patient portal login.",
            ),
        ),
    ]
