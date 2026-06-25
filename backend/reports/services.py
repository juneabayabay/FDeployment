from datetime import date, timedelta
from decimal import Decimal

from django.db.models import Count, Sum
from django.utils import timezone

from appointments.models import Appointment, WaitingListEntry
from billing.models import BillingRecord, DownPaymentRequest
from users.models import Role, User


def _month_start(d: date) -> date:
    return d.replace(day=1)


def get_dashboard_stats() -> dict:
    today = timezone.localdate()
    month_start = _month_start(today)

    today_appointments = Appointment.objects.filter(appointment_date=today).exclude(
        status=Appointment.Status.CANCELLED
    )
    pending_statuses = [
        Appointment.Status.PENDING,
        Appointment.Status.PENCIL_BOOKED,
    ]

    revenue_today = BillingRecord.objects.filter(created_at__date=today).aggregate(
        total=Sum("amount_paid")
    )["total"] or Decimal("0")

    revenue_month = BillingRecord.objects.filter(created_at__date__gte=month_start).aggregate(
        total=Sum("amount_paid")
    )["total"] or Decimal("0")

    active_patients = User.objects.filter(
        deleted_at__isnull=True,
        is_active=True,
        user_roles__role__slug=Role.USER,
    ).distinct().count()

    new_patients_month = User.objects.filter(
        deleted_at__isnull=True,
        created_at__date__gte=month_start,
        user_roles__role__slug=Role.USER,
    ).distinct().count()

    unpaid_records = BillingRecord.objects.filter(
        payment_status__in=[
            BillingRecord.PaymentStatus.UNPAID,
            BillingRecord.PaymentStatus.PARTIAL,
        ]
    )
    outstanding_balance = sum(r.balance for r in unpaid_records)

    return {
        "date": today.isoformat(),
        "today_appointments": today_appointments.count(),
        "pending_appointments": Appointment.objects.filter(status__in=pending_statuses).count(),
        "pencil_booked": Appointment.objects.filter(
            status=Appointment.Status.PENCIL_BOOKED
        ).count(),
        "waiting_list_count": WaitingListEntry.objects.filter(is_active=True).count(),
        "pending_down_payments": DownPaymentRequest.objects.filter(
            status=DownPaymentRequest.Status.PENDING
        ).count(),
        "revenue_today": str(revenue_today),
        "revenue_month": str(revenue_month),
        "outstanding_balance": str(outstanding_balance),
        "outstanding_records": unpaid_records.count(),
        "active_patients": active_patients,
        "new_patients_month": new_patients_month,
    }


def get_period_report(period: str, from_date: date | None, to_date: date | None) -> dict:
    today = timezone.localdate()

    if from_date and to_date:
        start, end = from_date, to_date
    elif period == "daily":
        start, end = today, today
    elif period == "weekly":
        start, end = today - timedelta(days=today.weekday()), today
    elif period == "monthly":
        start, end = _month_start(today), today
    elif period == "quarterly":
        quarter_month = ((today.month - 1) // 3) * 3 + 1
        start = today.replace(month=quarter_month, day=1)
        end = today
    else:
        start, end = _month_start(today), today

    appointments = Appointment.objects.filter(
        appointment_date__gte=start,
        appointment_date__lte=end,
    )
    status_counts = {
        row["status"]: row["count"]
        for row in appointments.values("status").annotate(count=Count("id"))
    }

    billing = BillingRecord.objects.filter(created_at__date__gte=start, created_at__date__lte=end)
    revenue = billing.aggregate(
        collected=Sum("amount_paid"),
        billed=Sum("total_amount"),
    )

    completed = appointments.filter(status=Appointment.Status.COMPLETED).count()
    cancelled = appointments.filter(status=Appointment.Status.CANCELLED).count()
    cancellation_fees = appointments.filter(cancellation_fee__gt=0).aggregate(
        total=Sum("cancellation_fee")
    )["total"] or Decimal("0")

    daily_breakdown = []
    if (end - start).days <= 31:
        cursor = start
        while cursor <= end:
            day_appts = appointments.filter(appointment_date=cursor)
            day_billing = BillingRecord.objects.filter(created_at__date=cursor)
            daily_breakdown.append(
                {
                    "date": cursor.isoformat(),
                    "appointments": day_appts.count(),
                    "completed": day_appts.filter(status=Appointment.Status.COMPLETED).count(),
                    "revenue": str(
                        day_billing.aggregate(t=Sum("amount_paid"))["t"] or Decimal("0")
                    ),
                }
            )
            cursor += timedelta(days=1)

    return {
        "period": period,
        "from": start.isoformat(),
        "to": end.isoformat(),
        "appointment_counts": status_counts,
        "appointments_total": appointments.count(),
        "appointments_completed": completed,
        "appointments_cancelled": cancelled,
        "patient_visits": completed,
        "revenue_collected": str(revenue["collected"] or Decimal("0")),
        "revenue_billed": str(revenue["billed"] or Decimal("0")),
        "cancellation_fees": str(cancellation_fees),
        "daily_breakdown": daily_breakdown,
    }
