CLINIC_NAME = "Barnabas Dental Clinic"


def _appointment_when(appointment):
    return (
        f"{appointment.appointment_date.strftime('%A, %B %d, %Y')} "
        f"at {appointment.start_time.strftime('%I:%M %p')}"
    )


def build_appointment_confirmed_email(appointment):
    when = _appointment_when(appointment)
    subject = f"{CLINIC_NAME} — appointment confirmed"
    text_body = (
        f"Hello {appointment.patient.first_name},\n\n"
        f"Your appointment is confirmed for {when}.\n\n"
        f"— {CLINIC_NAME}"
    )
    return subject, text_body


def build_appointment_cancelled_email(appointment, fee=0):
    when = _appointment_when(appointment)
    fee_line = f"\nA cancellation fee of ₱{fee} has been added to your billing.\n" if fee else ""
    subject = f"{CLINIC_NAME} — appointment cancelled"
    text_body = (
        f"Hello {appointment.patient.first_name},\n\n"
        f"Your appointment on {when} was cancelled.{fee_line}\n"
        f"— {CLINIC_NAME}"
    )
    return subject, text_body


def build_appointment_reminder_email(appointment):
    when = _appointment_when(appointment)
    subject = f"Reminder: appointment tomorrow — {CLINIC_NAME}"
    text_body = (
        f"Hello {appointment.patient.first_name},\n\n"
        f"This is a reminder that you have an appointment tomorrow ({when}).\n\n"
        f"— {CLINIC_NAME}"
    )
    return subject, text_body


def build_follow_up_reminder_email(appointment):
    when = _appointment_when(appointment)
    subject = f"Follow-up reminder — {CLINIC_NAME}"
    text_body = (
        f"Hello {appointment.patient.first_name},\n\n"
        f"We hope you are doing well after your visit on {when}. "
        f"Please contact the clinic if you need a follow-up appointment.\n\n"
        f"— {CLINIC_NAME}"
    )
    return subject, text_body


def build_waiting_list_slot_email(appointment_date):
    subject = f"Slot available — {CLINIC_NAME}"
    text_body = (
        f"A slot opened on {appointment_date}. "
        f"Sign in to your patient portal to book before it is taken.\n\n"
        f"— {CLINIC_NAME}"
    )
    return subject, text_body
