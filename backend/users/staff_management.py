from rest_framework.exceptions import PermissionDenied

from .models import Role

MANAGED_STAFF_ROLE_SLUGS = {Role.DENTIST, Role.RECEPTIONIST}


def actor_is_admin(user):
    if user.is_superuser:
        return True
    return user.user_roles.filter(role__slug=Role.ADMIN).exists()


def target_is_managed_staff(user):
    return user.user_roles.filter(role__slug__in=MANAGED_STAFF_ROLE_SLUGS).exists()


def assert_actor_can_manage_target(actor, target):
    if actor.pk == target.pk:
        raise PermissionDenied("You cannot modify your own account this way.")
    if actor_is_admin(actor):
        return
    if target.user_roles.filter(role__slug=Role.ADMIN).exists():
        raise PermissionDenied("Administrator accounts cannot be modified this way.")
    if not target_is_managed_staff(target):
        raise PermissionDenied("You can only manage dentist and receptionist accounts.")
