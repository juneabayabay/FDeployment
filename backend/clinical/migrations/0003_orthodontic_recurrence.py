from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("clinical", "0002_prescriptionrecord"),
    ]

    operations = [
        migrations.AddField(
            model_name="orthodonticrecord",
            name="adjustment_interval_weeks",
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="orthodonticrecord",
            name="next_adjustment_date",
            field=models.DateField(blank=True, null=True),
        ),
    ]
