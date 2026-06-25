from decimal import Decimal

DEFAULTS = {
    "pencil_booking_hours": "4",
    "max_daily_patients": "10",
    "cancellation_window_hours": "24",
    "no_show_fee": "300",
    "clinic_open": "09:00",
    "clinic_close": "18:00",
    "lunch_start": "12:00",
    "lunch_end": "13:00",
}


def get_setting(key, default=None):
    from .models import ClinicSetting

    try:
        return ClinicSetting.objects.get(key=key).value
    except ClinicSetting.DoesNotExist:
        return default if default is not None else DEFAULTS.get(key, "")


def get_pencil_booking_hours():
    return int(get_setting("pencil_booking_hours", DEFAULTS["pencil_booking_hours"]))


def get_max_daily_patients():
    return int(get_setting("max_daily_patients", DEFAULTS["max_daily_patients"]))


def get_cancellation_window_hours():
    return int(
        get_setting("cancellation_window_hours", DEFAULTS["cancellation_window_hours"])
    )


def get_no_show_fee():
    return Decimal(get_setting("no_show_fee", DEFAULTS["no_show_fee"]))


from datetime import time


def _parse_time_string(value):
    parts = value.strip().split(":")
    return time(int(parts[0]), int(parts[1]))


def get_clinic_open_time():
    return _parse_time_string(get_setting("clinic_open", DEFAULTS["clinic_open"]))


def get_clinic_close_time():
    return _parse_time_string(get_setting("clinic_close", DEFAULTS["clinic_close"]))


def get_lunch_start_time():
    return _parse_time_string(get_setting("lunch_start", DEFAULTS["lunch_start"]))


def get_lunch_end_time():
    return _parse_time_string(get_setting("lunch_end", DEFAULTS["lunch_end"]))


def get_clinic_info():
    return {
        "schedule": "Monday – Saturday, 9:00 AM – 6:00 PM",
        "lunch_break": "12:00 PM – 1:00 PM (blocked)",
        "max_daily_patients": get_max_daily_patients(),
        "pencil_booking_hours": get_pencil_booking_hours(),
        "cancellation_window_hours": get_cancellation_window_hours(),
        "no_show_fee": str(get_no_show_fee()),
        "appointment_statuses": [
            {"value": s.value, "label": s.label}
            for s in __import__(
                "appointments.models", fromlist=["Appointment"]
            ).Appointment.Status
        ],
    }
