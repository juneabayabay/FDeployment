from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import ClinicPermission, Role, RolePermission, User, UserRole


class ClinicPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClinicPermission
        fields = [
            "id",
            "codename",
            "name",
            "module",
            "action",
            "description",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class RolePermissionSerializer(serializers.ModelSerializer):
    permission = ClinicPermissionSerializer(read_only=True)
    permission_id = serializers.PrimaryKeyRelatedField(
        queryset=ClinicPermission.objects.all(),
        source="permission",
        write_only=True,
    )
    role_name = serializers.CharField(source="role.name", read_only=True)

    class Meta:
        model = RolePermission
        fields = [
            "id",
            "role",
            "role_name",
            "permission",
            "permission_id",
            "granted_at",
        ]
        read_only_fields = ["id", "granted_at"]


class RoleSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "is_system_role",
            "permissions",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "is_system_role", "created_at", "updated_at"]

    def get_permissions(self, obj):
        permissions = ClinicPermission.objects.filter(role_permissions__role=obj)
        return ClinicPermissionSerializer(permissions, many=True).data


class UserRoleSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(),
        source="role",
        write_only=True,
    )
    user_email = serializers.EmailField(source="user.email", read_only=True)
    assigned_by_email = serializers.EmailField(
        source="assigned_by.email",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = UserRole
        fields = [
            "id",
            "user",
            "user_email",
            "role",
            "role_id",
            "assigned_by",
            "assigned_by_email",
            "assigned_at",
        ]
        read_only_fields = ["id", "assigned_by", "assigned_at"]

    def validate_role_id(self, value):
        if value.slug == Role.ADMIN:
            request = self.context.get("request")
            actor = getattr(request, "user", None)
            if not actor or not actor.is_superuser:
                raise serializers.ValidationError(
                    "Only a superuser can assign the admin role."
                )
        return value


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    role_slugs = serializers.ListField(child=serializers.CharField(), read_only=True)
    permission_codenames = serializers.ListField(
        child=serializers.CharField(),
        read_only=True,
    )
    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "full_name",
            "phone",
            "avatar_url",
            "is_active",
            "is_staff",
            "is_superuser",
            "email_verified_at",
            "role_slugs",
            "permission_codenames",
            "roles",
            "last_login",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "is_staff",
            "is_superuser",
            "email_verified_at",
            "last_login",
            "created_at",
            "updated_at",
        ]

    def get_roles(self, obj):
        roles = Role.objects.filter(user_roles__user=obj)
        return RoleSerializer(roles, many=True).data


class PublicRegisterSerializer(serializers.ModelSerializer):
    """Public patient self-registration — always assigns the `user` role."""

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "first_name",
            "last_name",
            "phone",
            "avatar_url",
            "password",
            "password_confirm",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        role = Role.objects.get(slug=Role.USER)
        user = User.objects.create_user(
            password=password,
            is_staff=False,
            **validated_data,
        )
        UserRole.objects.create(user=user, role=role)
        return user


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    role_slug = serializers.SlugField(write_only=True)

    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "first_name",
            "last_name",
            "phone",
            "avatar_url",
            "password",
            "password_confirm",
            "role_slug",
        ]

    def validate_role_slug(self, value):
        allowed = {Role.DENTIST, Role.RECEPTIONIST}
        if value not in allowed:
            raise serializers.ValidationError(
                "Only dentist or receptionist accounts can be created through this endpoint."
            )
        if not Role.objects.filter(slug=value).exists():
            raise serializers.ValidationError("Invalid role.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        return attrs

    def create(self, validated_data):
        role_slug = validated_data.pop("role_slug")
        password = validated_data.pop("password")
        role = Role.objects.get(slug=role_slug)

        is_staff = role_slug in [Role.ADMIN, Role.DENTIST, Role.RECEPTIONIST]
        user = User.objects.create_user(
            password=password,
            is_staff=is_staff,
            **validated_data,
        )
        UserRole.objects.create(user=user, role=role)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "phone",
            "avatar_url",
        ]


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": "Passwords do not match."}
            )
        return attrs

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    def validate(self, attrs):
        data = super().validate(attrs)

        if self.user.deleted_at is not None:
            raise serializers.ValidationError("User account is inactive.")

        data["user"] = UserSerializer(self.user).data
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        token["full_name"] = user.full_name
        token["role_slugs"] = user.role_slugs
        token["permission_codenames"] = user.permission_codenames
        return token


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": "Passwords do not match."}
            )
        validate_password(attrs["new_password"])
        return attrs
