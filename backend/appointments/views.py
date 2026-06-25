from datetime import date

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from notifications.services import notify_appointment_cancelled, notify_waiting_list_for_freed_slot
from users.permissions import IsPatientUser

from .clinic_config import get_clinic_info
from .models import Appointment, Procedure, WaitingListEntry
from .serializers import (
    AppointmentCreateSerializer,
    AppointmentRescheduleSerializer,
    AppointmentSerializer,
    AvailableSlotsSerializer,
    ProcedureSerializer,
    WaitingListSerializer,
)
from .services import (
    calculate_cancellation_fee,
    find_compatible_slots,
    get_slots_meta,
)


class ProcedureListView(generics.ListAPIView):
    queryset = Procedure.objects.filter(is_active=True)
    serializer_class = ProcedureSerializer
    permission_classes = [IsAuthenticated, IsPatientUser]
    pagination_class = None


class ClinicInfoView(APIView):
    permission_classes = [IsAuthenticated, IsPatientUser]

    def get(self, request):
        return Response(get_clinic_info())


class AvailableSlotsView(APIView):
    permission_classes = [IsAuthenticated, IsPatientUser]

    def get(self, request):
        serializer = AvailableSlotsSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        meta = get_slots_meta(
            serializer.validated_data["date"],
            serializer.validated_data["duration_minutes"],
        )
        return Response(meta)


class CompatibleSlotsView(APIView):
    """Return time slots automatically matched to selected procedure duration."""

    permission_classes = [IsAuthenticated, IsPatientUser]

    def get(self, request):
        raw_ids = request.query_params.get("procedure_ids", "")
        procedure_ids = [int(x) for x in raw_ids.split(",") if x.strip().isdigit()]
        if not procedure_ids:
            return Response(
                {"detail": "procedure_ids is required (comma-separated)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        preferred_date = None
        date_str = request.query_params.get("date")
        if date_str:
            try:
                preferred_date = date.fromisoformat(date_str)
            except ValueError:
                return Response(
                    {"detail": "Invalid date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        result = find_compatible_slots(
            procedure_ids,
            preferred_date=preferred_date,
        )
        if result["procedures"] == [] and result["duration_minutes"] == 0:
            return Response(
                {"detail": "One or more procedures are invalid."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(result)


class AppointmentListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsPatientUser]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AppointmentCreateSerializer
        return AppointmentSerializer

    def get_queryset(self):
        qs = Appointment.objects.filter(patient=self.request.user).prefetch_related(
            "procedures"
        )
        status_filter = self.request.query_params.get("status")
        if status_filter == "active":
            qs = qs.filter(status__in=Appointment.ACTIVE_STATUSES)
        elif status_filter == "history":
            qs = qs.filter(
                status__in=[
                    Appointment.Status.CANCELLED,
                    Appointment.Status.COMPLETED,
                    Appointment.Status.NO_SHOW,
                ]
            )
        return qs

    def create(self, request, *args, **kwargs):
        serializer = AppointmentCreateSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        appointment = serializer.save()
        return Response(
            AppointmentSerializer(appointment).data,
            status=status.HTTP_201_CREATED,
        )


class AppointmentDetailView(generics.RetrieveAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsPatientUser]

    def get_queryset(self):
        return Appointment.objects.filter(patient=self.request.user).prefetch_related(
            "procedures"
        )


class AppointmentCancelView(APIView):
    permission_classes = [IsAuthenticated, IsPatientUser]

    def post(self, request, pk):
        try:
            appointment = Appointment.objects.get(pk=pk, patient=request.user)
        except Appointment.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if appointment.status not in Appointment.ACTIVE_STATUSES:
            return Response(
                {"detail": "This appointment cannot be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        fee = calculate_cancellation_fee(appointment)
        appointment.status = Appointment.Status.CANCELLED
        appointment.cancellation_fee = fee
        appointment.save(update_fields=["status", "cancellation_fee", "updated_at"])

        from billing.services import post_cancellation_fee

        post_cancellation_fee(appointment)

        notify_appointment_cancelled(appointment, fee)
        procedure_ids = list(appointment.procedures.values_list("id", flat=True))
        notify_waiting_list_for_freed_slot(appointment.appointment_date, procedure_ids)
        return Response(AppointmentSerializer(appointment).data)


class AppointmentRescheduleView(APIView):
    permission_classes = [IsAuthenticated, IsPatientUser]

    def post(self, request, pk):
        try:
            appointment = Appointment.objects.get(pk=pk, patient=request.user)
        except Appointment.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if appointment.status not in Appointment.ACTIVE_STATUSES:
            return Response(
                {"detail": "This appointment cannot be rescheduled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = AppointmentRescheduleSerializer(
            data=request.data,
            context={"appointment": appointment},
        )
        serializer.is_valid(raise_exception=True)
        appointment = serializer.save_reschedule(appointment)
        return Response(AppointmentSerializer(appointment).data)


class WaitingListView(generics.ListCreateAPIView):
    serializer_class = WaitingListSerializer
    permission_classes = [IsAuthenticated, IsPatientUser]
    pagination_class = None

    def get_queryset(self):
        return WaitingListEntry.objects.filter(
            patient=self.request.user,
            is_active=True,
        ).prefetch_related("procedures")

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user)


class WaitingListLeaveView(APIView):
    permission_classes = [IsAuthenticated, IsPatientUser]

    def post(self, request, pk):
        try:
            entry = WaitingListEntry.objects.get(
                pk=pk,
                patient=request.user,
                is_active=True,
            )
        except WaitingListEntry.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        entry.is_active = False
        entry.save(update_fields=["is_active"])
        return Response({"detail": "Removed from waiting list."})
