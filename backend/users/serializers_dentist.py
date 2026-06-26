from rest_framework import serializers

from .models import DentistProfile, Role, User


def resolve_user_avatar_url(user, request=None):
    if user.avatar:
        url = user.avatar.url
        if request:
            return request.build_absolute_uri(url)
        return url
    return user.avatar_url or None


class DentistProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    display_name = serializers.CharField(read_only=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = DentistProfile
        fields = [
            "id",
            "user_id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "display_name",
            "avatar_url",
            "title",
            "specialization",
            "years_experience",
            "bio",
            "schedule_summary",
            "is_visible",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_avatar_url(self, obj):
        return resolve_user_avatar_url(obj.user, self.context.get("request"))


class DentistProfileWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = DentistProfile
        fields = [
            "title",
            "specialization",
            "years_experience",
            "bio",
            "schedule_summary",
            "is_visible",
        ]

    def validate_years_experience(self, value):
        if value > 80:
            raise serializers.ValidationError("Years of experience seems too high.")
        return value


class DentistProfileAdminSerializer(DentistProfileWriteSerializer):
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(
            deleted_at__isnull=True,
            user_roles__role__slug=Role.DENTIST,
        ).distinct(),
        source="user",
        write_only=True,
    )

    class Meta(DentistProfileWriteSerializer.Meta):
        fields = DentistProfileWriteSerializer.Meta.fields + ["user_id"]
