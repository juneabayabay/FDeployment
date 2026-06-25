from django.urls import path

from .views import (
    AppointmentCancelView,
    AppointmentDetailView,
    AppointmentListCreateView,
    AppointmentRescheduleView,
    AvailableSlotsView,
    ClinicInfoView,
    CompatibleSlotsView,
    ProcedureListView,
    WaitingListLeaveView,
    WaitingListView,
)
from .views_staff import (
    StaffAppointmentCancelView,
    StaffAppointmentDetailView,
    StaffAppointmentListCreateView,
    StaffAppointmentRescheduleView,
    StaffScheduleView,
    StaffWaitingListBookView,
    StaffWaitingListDeactivateView,
    StaffWaitingListView,
)

app_name = "appointments"

urlpatterns = [
    path("clinic-info/", ClinicInfoView.as_view(), name="clinic-info"),
    path("procedures/", ProcedureListView.as_view(), name="procedures"),
    path("slots/", AvailableSlotsView.as_view(), name="slots"),
    path("slots/compatible/", CompatibleSlotsView.as_view(), name="slots-compatible"),
    # Staff routes (must precede <int:pk>/ patterns)
    path("staff/schedule/", StaffScheduleView.as_view(), name="staff-schedule"),
    path("staff/", StaffAppointmentListCreateView.as_view(), name="staff-list-create"),
    path("staff/<int:pk>/", StaffAppointmentDetailView.as_view(), name="staff-detail"),
    path("staff/<int:pk>/cancel/", StaffAppointmentCancelView.as_view(), name="staff-cancel"),
    path(
        "staff/<int:pk>/reschedule/",
        StaffAppointmentRescheduleView.as_view(),
        name="staff-reschedule",
    ),
    path("waiting-list/staff/", StaffWaitingListView.as_view(), name="staff-waiting-list"),
    path(
        "waiting-list/staff/<int:pk>/book/",
        StaffWaitingListBookView.as_view(),
        name="staff-waiting-list-book",
    ),
    path(
        "waiting-list/staff/<int:pk>/deactivate/",
        StaffWaitingListDeactivateView.as_view(),
        name="staff-waiting-list-deactivate",
    ),
    # Patient routes
    path("", AppointmentListCreateView.as_view(), name="list-create"),
    path("<int:pk>/", AppointmentDetailView.as_view(), name="detail"),
    path("<int:pk>/cancel/", AppointmentCancelView.as_view(), name="cancel"),
    path("<int:pk>/reschedule/", AppointmentRescheduleView.as_view(), name="reschedule"),
    path("waiting-list/", WaitingListView.as_view(), name="waiting-list"),
    path("waiting-list/<int:pk>/leave/", WaitingListLeaveView.as_view(), name="waiting-list-leave"),
]
