from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import ClinicPermission, DentistProfile, PatientProfile, Role, RolePermission, User, UserRole


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ("email",)
    list_display = ("email", "first_name", "last_name", "is_staff", "is_active")
    search_fields = ("email", "first_name", "last_name", "phone")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Personal info",
            {"fields": ("username", "first_name", "last_name", "phone", "avatar", "avatar_url")},
        ),
        (
            "Permissions",
            {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")},
        ),
        (
            "Important dates",
            {"fields": ("last_login", "email_verified_at", "created_at", "updated_at", "deleted_at")},
        ),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "first_name", "last_name", "password1", "password2"),
            },
        ),
    )
    readonly_fields = ("created_at", "updated_at", "last_login")


@admin.register(DentistProfile)
class DentistProfileAdmin(admin.ModelAdmin):
    list_display = (
        "display_name",
        "specialization",
        "years_experience",
        "is_visible",
        "updated_at",
    )
    list_filter = ("is_visible", "specialization")
    search_fields = (
        "user__email",
        "user__first_name",
        "user__last_name",
        "specialization",
    )
    raw_id_fields = ("user",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "date_of_birth", "updated_at")
    search_fields = ("user__email", "user__first_name", "user__last_name")
    raw_id_fields = ("user",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_system_role")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "assigned_by", "assigned_at")
    list_filter = ("role",)
    search_fields = ("user__email", "role__name")


@admin.register(ClinicPermission)
class ClinicPermissionAdmin(admin.ModelAdmin):
    list_display = ("codename", "name", "module", "action")
    list_filter = ("module",)
    search_fields = ("codename", "name", "module")


@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ("role", "permission", "granted_at")
    list_filter = ("role", "permission__module")
    search_fields = ("role__name", "permission__codename")
