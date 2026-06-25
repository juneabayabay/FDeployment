from audit.models import AuditLog


def log_audit(
    *,
    actor=None,
    action,
    module,
    resource_type,
    resource_id="",
    summary="",
    changes=None,
    ip_address=None,
):
    AuditLog.objects.create(
        actor=actor,
        action=action,
        module=module,
        resource_type=resource_type,
        resource_id=str(resource_id) if resource_id else "",
        summary=summary[:255],
        changes=changes or {},
        ip_address=ip_address,
    )


def client_ip(request):
    if request is None:
        return None
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")
