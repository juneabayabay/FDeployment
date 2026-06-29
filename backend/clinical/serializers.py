from rest_framework import serializers

from .models import OrthodonticRecord, PrescriptionRecord, SurgicalRecord, TreatmentRecord


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
            "next_adjustment_date",
            "adjustment_interval_weeks",
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


class PrescriptionRecordSerializer(serializers.ModelSerializer):
    prescribed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = PrescriptionRecord
        fields = [
            "id",
            "medication",
            "dosage",
            "instructions",
            "prescribed_date",
            "prescribed_by",
            "prescribed_by_name",
            "created_at",
        ]
        read_only_fields = ["id", "prescribed_by", "prescribed_by_name", "created_at"]

    def get_prescribed_by_name(self, obj):
        if obj.prescribed_by:
            return obj.prescribed_by.full_name
        return None
