from rest_framework import serializers

from .models import ClinicSetting, Procedure


class ClinicSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClinicSetting
        fields = ["key", "value", "description", "updated_at"]
        read_only_fields = ["updated_at"]


class StaffProcedureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Procedure
        fields = [
            "id",
            "name",
            "slug",
            "category",
            "duration_minutes",
            "price",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def create(self, validated_data):
        from django.utils.text import slugify

        if not validated_data.get("slug"):
            validated_data["slug"] = slugify(validated_data["name"])
        return super().create(validated_data)
