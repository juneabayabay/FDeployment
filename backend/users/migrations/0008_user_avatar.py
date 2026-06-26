# Generated manually for Phase 1 avatar upload

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0007_receptionist_permissions"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="avatar",
            field=models.ImageField(blank=True, upload_to="avatars/%Y/%m/"),
        ),
    ]
