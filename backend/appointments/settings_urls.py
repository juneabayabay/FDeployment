from django.urls import path

from .views_settings import (
    ClinicSettingDetailView,
    ClinicSettingsListView,
    EmailSettingsView,
    StaffProcedureDetailView,
    StaffProcedureListCreateView,
    StaffProcedurePackageDetailView,
    StaffProcedurePackageListCreateView,
)

app_name = "settings"

urlpatterns = [
    path("clinic/", ClinicSettingsListView.as_view(), name="clinic-settings"),
    path("clinic/<str:key>/", ClinicSettingDetailView.as_view(), name="clinic-setting-detail"),
    path("email/", EmailSettingsView.as_view(), name="email-settings"),
    path("procedures/", StaffProcedureListCreateView.as_view(), name="procedures"),
    path("procedures/<int:pk>/", StaffProcedureDetailView.as_view(), name="procedure-detail"),
    path("packages/", StaffProcedurePackageListCreateView.as_view(), name="packages"),
    path("packages/<int:pk>/", StaffProcedurePackageDetailView.as_view(), name="package-detail"),
]
