from django.urls import path

from .views import DashboardStatsView, ReportsView

app_name = "reports"

urlpatterns = [
    path("dashboard/stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("", ReportsView.as_view(), name="reports"),
]
