from datetime import date

from rest_framework.response import Response
from rest_framework.views import APIView

from appointments.mixins import StaffPermissionMixin

from .services import get_dashboard_stats, get_period_report


class DashboardStatsView(StaffPermissionMixin, APIView):
    staff_permissions = {"GET": "reports.view"}

    def get(self, request):
        return Response(get_dashboard_stats())


class ReportsView(StaffPermissionMixin, APIView):
    staff_permissions = {"GET": "reports.view"}

    def get(self, request):
        period = request.query_params.get("period", "monthly")
        from_str = request.query_params.get("from")
        to_str = request.query_params.get("to")

        from_date = None
        to_date = None
        if from_str:
            try:
                from_date = date.fromisoformat(from_str)
            except ValueError:
                return Response({"detail": "Invalid from date."}, status=400)
        if to_str:
            try:
                to_date = date.fromisoformat(to_str)
            except ValueError:
                return Response({"detail": "Invalid to date."}, status=400)

        return Response(get_period_report(period, from_date, to_date))
