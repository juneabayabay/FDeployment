from rest_framework import serializers

from .models import OrthodonticRecord, SurgicalRecord, TreatmentRecord


class TreatmentRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = TreatmentRecord
        fields = [
            "id",
            "title",
            "notes",
            "treatment_date",
            "created_by",
            "created_at",
        ]
        read_only_fields = ["id", "created_by", "created_at"]


class OrthodonticRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrthodonticRecord
        fields = [
            "id",
            "phase",
            "progress_notes",
            "updated_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "updated_by", "created_at", "updated_at"]


class SurgicalRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurgicalRecord
        fields = [
            "id",
            "procedure_name",
            "notes",
            "surgery_date",
            "created_by",
            "created_at",
        ]
        read_only_fields = ["id", "created_by", "created_at"]
