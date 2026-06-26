from django.contrib import admin

from .models import Appointment, ClinicSetting, Procedure, WaitingListEntry


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = (
        "patient",
        "dentist",
        "appointment_date",
        "start_time",
        "status",
    )
    list_filter = ("status", "appointment_date")
    search_fields = ("patient__email", "dentist__email")
    raw_id_fields = ("patient", "dentist")


admin.site.register(ClinicSetting)
admin.site.register(Procedure)
admin.site.register(WaitingListEntry)
