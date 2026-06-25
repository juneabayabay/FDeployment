# Generated manually for payment_method field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("billing", "0002_phase2"),
    ]

    operations = [
        migrations.AddField(
            model_name="billingrecord",
            name="payment_method",
            field=models.CharField(
                blank=True,
                choices=[
                    ("cash", "Cash"),
                    ("gcash", "GCash"),
                    ("other", "Other"),
                ],
                default="",
                max_length=20,
            ),
        ),
    ]
