from datetime import date, datetime, time, timedelta

from django.utils import timezone

from .clinic_config import (
    get_cancellation_window_hours,
    get_clinic_close_time,
    get_clinic_open_time,
    get_lunch_end_time,
    get_lunch_start_time,
    get_max_daily_patients,
    get_no_show_fee,
)
from .models import Appointment, Procedure

SLOT_INTERVAL_MINUTES = 30

ACTIVE_STATUSES = Appointment.ACTIVE_STATUSES


def is_clinic_day(d: date) -> bool:
    return d.weekday() < 6


def _to_datetime(d: date, t: time) -> datetime:
    return timezone.make_aware(datetime.combine(d, t))


def _overlaps_lunch(start: time, end: time) -> bool:
    lunch_start = get_lunch_start_time()
    lunch_end = get_lunch_end_time()
    return start < lunch_end and end > lunch_start


def _times_overlap(start_a: time, end_a: time, start_b: time, end_b: time) -> bool:
    return start_a < end_b and end_a > start_b


class SlotUnavailableError(Exception):
    def __init__(self, field, message):
        self.field = field
        self.message = message
        super().__init__(message)


def assert_slot_available(
    appointment_date,
    start_time,
    end_time,
    exclude_appointment_id=None,
):
    """Lock and verify slot availability under concurrency (call inside transaction.atomic)."""
    qs = Appointment.objects.select_for_update().filter(
        appointment_date=appointment_date,
        status__in=ACTIVE_STATUSES,
    )
    if exclude_appointment_id:
        qs = qs.exclude(pk=exclude_appointment_id)

    if qs.count() >= get_max_daily_patients():
        raise SlotUnavailableError("appointment_date", "This day is fully booked.")

    for existing in qs:
        if _times_overlap(start_time, end_time, existing.start_time, existing.end_time):
            raise SlotUnavailableError(
                "start_time",
                "Selected time slot is no longer available.",
            )


def get_daily_appointment_count(appointment_date: date) -> int:
    return Appointment.objects.filter(
        appointment_date=appointment_date,
        status__in=ACTIVE_STATUSES,
    ).count()


def is_daily_capacity_full(appointment_date: date) -> bool:
    return get_daily_appointment_count(appointment_date) >= get_max_daily_patients()


def get_booked_ranges(appointment_date: date):
    appointments = Appointment.objects.filter(
        appointment_date=appointment_date,
        status__in=ACTIVE_STATUSES,
    )
    return [(a.start_time, a.end_time) for a in appointments]


def generate_time_slots(appointment_date: date, duration_minutes: int):
    if not is_clinic_day(appointment_date):
        return []

    if is_daily_capacity_full(appointment_date):
        return []

    today = timezone.localdate()
    now = timezone.localtime()
    booked = get_booked_ranges(appointment_date)
    slots = []

    current = datetime.combine(appointment_date, get_clinic_open_time())
    end_of_day = datetime.combine(appointment_date, get_clinic_close_time())

    while current + timedelta(minutes=duration_minutes) <= end_of_day:
        slot_start = current.time()
        slot_end = (current + timedelta(minutes=duration_minutes)).time()

        if _overlaps_lunch(slot_start, slot_end):
            current = datetime.combine(appointment_date, get_lunch_end_time())
            continue

        if appointment_date == today:
            slot_dt = _to_datetime(appointment_date, slot_start)
            if slot_dt <= now:
                current += timedelta(minutes=SLOT_INTERVAL_MINUTES)
                continue

        conflict = any(
            _times_overlap(slot_start, slot_end, b_start, b_end)
            for b_start, b_end in booked
        )
        if not conflict:
            slots.append(
                {
                    "start_time": slot_start.strftime("%H:%M"),
                    "end_time": slot_end.strftime("%H:%M"),
                }
            )

        current += timedelta(minutes=SLOT_INTERVAL_MINUTES)

    return slots


def _format_duration_label(minutes: int) -> str:
    if minutes < 60:
        return f"{minutes} min"
    hrs = minutes // 60
    mins = minutes % 60
    if mins == 0:
        return f"{hrs} hour" if hrs == 1 else f"{hrs} hours"
    return f"{hrs} hr {mins} min"


def get_slots_meta(appointment_date: date, duration_minutes: int):
    daily_full = is_daily_capacity_full(appointment_date)
    slots = [] if daily_full else generate_time_slots(appointment_date, duration_minutes)
    message = ""
    if not is_clinic_day(appointment_date):
        message = "Clinic is closed on Sundays."
    elif daily_full:
        message = (
            f"This day is fully booked ({get_max_daily_patients()} patients max). "
            "Join the waiting list below."
        )
    elif duration_minutes < 1:
        message = "Select at least one procedure to calculate appointment duration."
    elif not slots and is_clinic_day(appointment_date):
        message = (
            f"No { _format_duration_label(duration_minutes) } slots fit on this date. "
            "Try another date or fewer procedures."
        )
    return {
        "slots": slots,
        "daily_full": daily_full,
        "daily_count": get_daily_appointment_count(appointment_date),
        "max_daily_patients": get_max_daily_patients(),
        "duration_minutes": duration_minutes,
        "duration_label": _format_duration_label(duration_minutes),
        "message": message,
    }


def calculate_cancellation_fee(appointment: Appointment):
    appt_dt = _to_datetime(appointment.appointment_date, appointment.start_time)
    hours_until = (appt_dt - timezone.now()).total_seconds() / 3600
    if hours_until < get_cancellation_window_hours():
        return get_no_show_fee()
    return 0


def get_procedure_duration_and_total(procedure_ids):
    procedures = list(
        Procedure.objects.filter(id__in=procedure_ids, is_active=True).order_by("name")
    )
    if len(procedures) != len(procedure_ids):
        return None, None, None
    duration = sum(p.duration_minutes for p in procedures)
    total_amount = sum(p.price for p in procedures)
    return procedures, duration, total_amount


def find_compatible_slots(procedure_ids, preferred_date=None, scan_days=21):
    """
    Auto-match appointment duration from selected procedures and return
    compatible time slots. Scans forward from preferred_date (or today)
    until slots are found or scan_days exhausted.
    """
    procedures, duration, total_amount = get_procedure_duration_and_total(procedure_ids)
    if not procedures or duration < 1:
        return {
            "procedures": [],
            "duration_minutes": 0,
            "duration_label": _format_duration_label(0),
            "total_amount": "0",
            "date": None,
            "slots": [],
            "auto_matched": False,
            "message": "Select at least one valid procedure.",
        }

    base = {
        "procedures": [
            {"id": p.id, "name": p.name, "duration_minutes": p.duration_minutes, "price": str(p.price)}
            for p in procedures
        ],
        "duration_minutes": duration,
        "duration_label": _format_duration_label(duration),
        "total_amount": str(total_amount),
        "auto_matched": True,
    }

    if preferred_date:
        if preferred_date < timezone.localdate():
            return {
                **base,
                "date": None,
                "slots": [],
                "daily_full": False,
                "message": "Cannot book a date in the past.",
            }
        meta = get_slots_meta(preferred_date, duration)
        msg = meta["message"]
        if meta["slots"] and not msg:
            msg = (
                f"Showing {len(meta['slots'])} compatible time(s) for your "
                f"{_format_duration_label(duration)} appointment."
            )
        return {
            **base,
            "date": preferred_date.isoformat(),
            "slots": meta["slots"],
            "daily_full": meta["daily_full"],
            "message": msg,
        }

    start = timezone.localdate()
    matched_date = None
    slots = []
    message = ""

    for offset in range(scan_days):
        candidate = start + timedelta(days=offset)
        if not is_clinic_day(candidate):
            continue
        meta = get_slots_meta(candidate, duration)
        if meta["slots"]:
            matched_date = candidate
            slots = meta["slots"]
            message = (
                f"Auto-matched: {len(slots)} available time(s) for your "
                f"{_format_duration_label(duration)} appointment on "
                f"{candidate.strftime('%A, %b %d')}."
            )
            break

    if not matched_date:
        message = (
            f"No compatible {_format_duration_label(duration)} slots found in the "
            f"next {scan_days} days. Join the waiting list or try fewer procedures."
        )

    return {
        **base,
        "date": matched_date.isoformat() if matched_date else None,
        "slots": slots,
        "daily_full": False,
        "message": message,
    }
