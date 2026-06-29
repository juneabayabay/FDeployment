from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to="avatars/%Y/%m/", blank=True)
    avatar_url = models.URLField(blank=True)  # legacy external URL; prefer uploaded avatar

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    email_verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        db_table = "users"
        indexes = [
            models.Index(fields=["last_name", "first_name"]),
            models.Index(fields=["is_active"]),
        ]

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def role_slugs(self):
        return list(self.user_roles.values_list("role__slug", flat=True))

    @property
    def is_clinic_staff(self):
        return self.user_roles.filter(
            role__slug__in=[Role.ADMIN, Role.DENTIST, Role.RECEPTIONIST]
        ).exists()

    @property
    def is_patient_user(self):
        return self.user_roles.filter(role__slug=Role.USER).exists()

    @property
    def permission_codenames(self):
        if self.is_superuser:
            return list(
                ClinicPermission.objects.values_list("codename", flat=True)
            )
        return list(
            ClinicPermission.objects.filter(
                role_permissions__role__user_roles__user=self
            )
            .values_list("codename", flat=True)
            .distinct()
        )

    def has_clinic_permission(self, codename):
        if self.is_superuser:
            return True
        return ClinicPermission.objects.filter(
            codename=codename,
            role_permissions__role__user_roles__user=self,
        ).exists()

    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.is_active = False
        self.save(update_fields=["deleted_at", "is_active", "updated_at"])


class DentistProfile(models.Model):
    """Public-facing profile for dentists shown in the patient directory."""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="dentist_profile",
    )
    title = models.CharField(max_length=100, blank=True, default="Dr.")
    specialization = models.CharField(max_length=150, blank=True)
    years_experience = models.PositiveSmallIntegerField(default=0)
    bio = models.TextField(blank=True)
    schedule_summary = models.CharField(
        max_length=255,
        blank=True,
        help_text="Short schedule text, e.g. Mon–Fri 9:00 AM – 5:00 PM",
    )
    is_visible = models.BooleanField(
        default=True,
        help_text="Show this dentist in the patient-facing directory",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "dentist_profiles"
        ordering = ["user__last_name", "user__first_name"]

    def __str__(self):
        return f"{self.display_name} — {self.specialization or 'Dentist'}"

    @property
    def display_name(self):
        name = self.user.full_name
        if self.title and not name.lower().startswith(self.title.lower().rstrip(".")):
            return f"{self.title.rstrip('.')}. {name}".strip()
        return name


class PatientProfile(models.Model):
    """Demographics and medical history for patient users."""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="patient_profile",
    )
    date_of_birth = models.DateField(null=True, blank=True)
    medical_history = models.TextField(blank=True)
    allergies = models.TextField(blank=True)
    emergency_contact_name = models.CharField(max_length=150, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "patient_profiles"

    def __str__(self):
        return f"Profile — {self.user.email}"


class Role(models.Model):
    ADMIN = "admin"
    DENTIST = "dentist"
    RECEPTIONIST = "receptionist"
    USER = "user"

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_system_role = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "roles"

    def __str__(self):
        return self.name


class UserRole(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="user_roles",
    )
    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name="user_roles",
    )
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="roles_assigned",
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "user_roles"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "role"],
                name="uniq_user_role",
            )
        ]

    def __str__(self):
        return f"{self.user.email} → {self.role.slug}"


class ClinicPermission(models.Model):
    codename = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=150)
    module = models.CharField(max_length=50)
    action = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "permissions"
        constraints = [
            models.UniqueConstraint(
                fields=["module", "action"],
                name="uniq_permission_module_action",
            )
        ]

    def __str__(self):
        return self.codename


class RolePermission(models.Model):
    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name="role_permissions",
    )
    permission = models.ForeignKey(
        ClinicPermission,
        on_delete=models.CASCADE,
        related_name="role_permissions",
    )
    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "role_permissions"
        constraints = [
            models.UniqueConstraint(
                fields=["role", "permission"],
                name="uniq_role_permission",
            )
        ]

    def __str__(self):
        return f"{self.role.slug} → {self.permission.codename}"
