from rest_framework import serializers

from users.serializers import UserSerializer

from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "actor",
            "action",
            "module",
            "resource_type",
            "resource_id",
            "summary",
            "changes",
            "ip_address",
            "created_at",
        ]
