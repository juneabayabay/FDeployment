from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("appointments", "0005_remove_smtp_settings_from_db"),
    ]

    operations = [
        migrations.AddField(
            model_name="appointment",
            name="dentist",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="dentist_appointments",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddIndex(
            model_name="appointment",
            index=models.Index(
                fields=["dentist", "appointment_date"],
                name="appointment_dentist_0a1b2c_idx",
            ),
        ),
    ]
