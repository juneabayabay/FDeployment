from django.contrib import admin

from .models import Appointment, ClinicSetting, Procedure, WaitingListEntry

admin.site.register(ClinicSetting)
admin.site.register(Procedure)
admin.site.register(Appointment)
admin.site.register(WaitingListEntry)
