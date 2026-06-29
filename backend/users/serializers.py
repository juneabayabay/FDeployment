from datetime import date

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import ClinicPermission, PatientProfile, Role, RolePermission, User, UserRole
from .patient_account import get_patient_profile, patient_must_verify_email
from .walk_in import generate_walk_in_email, is_walk_in_placeholder_email

PATIENT_PROFILE_FIELD_NAMES = [
    "date_of_birth",
    "sex",
    "civil_status",
    "address",
    "medical_history",
    "allergies",
    "emergency_contact_name",
    "emergency_contact_phone",
]


def compute_age(date_of_birth):
    if not date_of_birth:
        return None
    today = date.today()
    return today.year - date_of_birth.year - (
        (today.month, today.day) < (date_of_birth.month, date_of_birth.day)
    )


def upsert_patient_profile(user, profile_data):
    if not profile_data or not user.is_patient_user:
        return
    profile, _ = PatientProfile.objects.get_or_create(user=user)
    for field, value in profile_data.items():
        setattr(profile, field, value)
    profile.save()


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
    avatar_url = serializers.SerializerMethodField()
    date_of_birth = serializers.SerializerMethodField()
    medical_history = serializers.SerializerMethodField()
    allergies = serializers.SerializerMethodField()
    emergency_contact_name = serializers.SerializerMethodField()
    emergency_contact_phone = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    is_walk_in_account = serializers.SerializerMethodField()
    sex = serializers.SerializerMethodField()
    civil_status = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    email_verification_required = serializers.SerializerMethodField()

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
            "date_of_birth",
            "sex",
            "civil_status",
            "address",
            "medical_history",
            "allergies",
            "emergency_contact_name",
            "emergency_contact_phone",
            "age",
            "is_walk_in_account",
            "email_verification_required",
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

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        if obj.avatar:
            url = obj.avatar.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return obj.avatar_url or None

    def get_roles(self, obj):
        roles = Role.objects.filter(user_roles__user=obj)
        return RoleSerializer(roles, many=True).data

    def get_date_of_birth(self, obj):
        profile = get_patient_profile(obj)
        return profile.date_of_birth if profile else None

    def get_medical_history(self, obj):
        profile = get_patient_profile(obj)
        return profile.medical_history if profile else ""

    def get_allergies(self, obj):
        profile = get_patient_profile(obj)
        return profile.allergies if profile else ""

    def get_emergency_contact_name(self, obj):
        profile = get_patient_profile(obj)
        return profile.emergency_contact_name if profile else ""

    def get_emergency_contact_phone(self, obj):
        profile = get_patient_profile(obj)
        return profile.emergency_contact_phone if profile else ""

    def get_age(self, obj):
        profile = get_patient_profile(obj)
        return compute_age(profile.date_of_birth) if profile else None

    def get_is_walk_in_account(self, obj):
        profile = get_patient_profile(obj)
        return bool(profile and profile.is_walk_in_account)

    def get_sex(self, obj):
        profile = get_patient_profile(obj)
        return profile.sex if profile else ""

    def get_civil_status(self, obj):
        profile = get_patient_profile(obj)
        return profile.civil_status if profile else ""

    def get_address(self, obj):
        profile = get_patient_profile(obj)
        return profile.address if profile else ""

    def get_email_verification_required(self, obj):
        return patient_must_verify_email(obj)


class WalkInPatientCreateSerializer(serializers.Serializer):
    """Staff-only walk-in registration — no password or real email required."""

    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    phone = serializers.CharField(max_length=20)
    email = serializers.EmailField(required=False, allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    sex = serializers.ChoiceField(
        choices=PatientProfile.Sex.choices, required=False, allow_blank=True
    )
    civil_status = serializers.ChoiceField(
        choices=PatientProfile.CivilStatus.choices, required=False, allow_blank=True
    )
    address = serializers.CharField(required=False, allow_blank=True)
    medical_history = serializers.CharField(required=False, allow_blank=True)
    allergies = serializers.CharField(required=False, allow_blank=True)
    emergency_contact_name = serializers.CharField(
        required=False, allow_blank=True, max_length=150
    )
    emergency_contact_phone = serializers.CharField(
        required=False, allow_blank=True, max_length=20
    )

    def validate_phone(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Phone is required.")
        return value

    def validate_email(self, value):
        value = (value or "").strip()
        if not value:
            return None
        if is_walk_in_placeholder_email(value):
            raise serializers.ValidationError("Use a real patient email or leave blank.")
        if User.objects.filter(email__iexact=value, deleted_at__isnull=True).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        profile_data = {}
        for field in PATIENT_PROFILE_FIELD_NAMES:
            if field in validated_data:
                profile_data[field] = validated_data.pop(field)

        email = validated_data.pop("email", None) or generate_walk_in_email()
        role = Role.objects.get(slug=Role.USER)
        user = User(
            email=email,
            first_name=validated_data["first_name"].strip(),
            last_name=validated_data["last_name"].strip(),
            phone=validated_data["phone"],
            is_active=True,
            email_verified_at=None,
        )
        user.set_unusable_password()
        user.save()
        UserRole.objects.create(user=user, role=role)

        profile, _ = PatientProfile.objects.get_or_create(user=user)
        profile.is_walk_in_account = True
        for field, value in profile_data.items():
            setattr(profile, field, value)
        profile.save()
        return user


class PublicRegisterSerializer(serializers.ModelSerializer):
    """Public patient self-registration — always assigns the `user` role."""

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    sex = serializers.ChoiceField(
        choices=PatientProfile.Sex.choices, required=False, allow_blank=True
    )
    civil_status = serializers.ChoiceField(
        choices=PatientProfile.CivilStatus.choices, required=False, allow_blank=True
    )
    address = serializers.CharField(required=False, allow_blank=True)
    medical_history = serializers.CharField(required=False, allow_blank=True)
    allergies = serializers.CharField(required=False, allow_blank=True)
    emergency_contact_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    emergency_contact_phone = serializers.CharField(required=False, allow_blank=True, max_length=20)

    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "first_name",
            "last_name",
            "phone",
            "password",
            "password_confirm",
            "date_of_birth",
            "sex",
            "civil_status",
            "address",
            "medical_history",
            "allergies",
            "emergency_contact_name",
            "emergency_contact_phone",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        return attrs

    def create(self, validated_data):
        profile_data = {}
        for field in PATIENT_PROFILE_FIELD_NAMES:
            if field in validated_data:
                profile_data[field] = validated_data.pop(field)

        password = validated_data.pop("password")
        role = Role.objects.get(slug=Role.USER)
        user = User.objects.create_user(
            password=password,
            is_staff=False,
            email_verified_at=None,
            **validated_data,
        )
        UserRole.objects.create(user=user, role=role)
        upsert_patient_profile(user, profile_data)
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
    email = serializers.EmailField(required=False)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    sex = serializers.ChoiceField(
        choices=PatientProfile.Sex.choices, required=False, allow_blank=True
    )
    civil_status = serializers.ChoiceField(
        choices=PatientProfile.CivilStatus.choices, required=False, allow_blank=True
    )
    address = serializers.CharField(required=False, allow_blank=True)
    medical_history = serializers.CharField(required=False, allow_blank=True)
    allergies = serializers.CharField(required=False, allow_blank=True)
    emergency_contact_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    emergency_contact_phone = serializers.CharField(required=False, allow_blank=True, max_length=20)

    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "first_name",
            "last_name",
            "phone",
            "date_of_birth",
            "sex",
            "civil_status",
            "address",
            "medical_history",
            "allergies",
            "emergency_contact_name",
            "emergency_contact_phone",
        ]

    def validate_email(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Email cannot be blank.")
        profile = get_patient_profile(self.instance)
        if not profile or not profile.is_walk_in_account:
            raise serializers.ValidationError(
                "Email can only be updated for walk-in accounts."
            )
        if is_walk_in_placeholder_email(value):
            raise serializers.ValidationError("Provide a real patient email address.")
        if (
            User.objects.filter(email__iexact=value, deleted_at__isnull=True)
            .exclude(pk=self.instance.pk)
            .exists()
        ):
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def update(self, instance, validated_data):
        profile_data = {}
        for field in PATIENT_PROFILE_FIELD_NAMES:
            if field in validated_data:
                profile_data[field] = validated_data.pop(field)

        if "email" in validated_data:
            instance.email = validated_data.pop("email")

        instance = super().update(instance, validated_data)
        upsert_patient_profile(instance, profile_data)
        return instance


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
        identifier = (attrs.get("email") or attrs.get("username") or "").strip()
        password = attrs.get("password")

        if not identifier or not password:
            raise serializers.ValidationError("Email/username and password are required.")

        user = (
            User.objects.filter(deleted_at__isnull=True, email__iexact=identifier).first()
            or User.objects.filter(
                deleted_at__isnull=True, username__iexact=identifier
            ).first()
        )

        if not user:
            raise serializers.ValidationError(
                "No active account found with the given credentials."
            )

        if not user.is_active:
            raise serializers.ValidationError("User account is inactive.")

        profile = get_patient_profile(user)
        if profile and profile.is_walk_in_account:
            raise serializers.ValidationError(
                "This account was created at the clinic and cannot sign in online. "
                "Ask reception to add your email, or register at the patient portal."
            )

        if not user.check_password(password):
            raise serializers.ValidationError(
                "No active account found with the given credentials."
            )

        self.user = user
        refresh = self.get_token(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(self.user, context=self.context).data,
        }

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


class VerifyEmailSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()


class ResendVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)


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
