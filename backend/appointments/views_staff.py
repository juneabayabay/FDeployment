from datetime import date

from django.db.models import Q
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from notifications.services import notify_appointment_cancelled, notify_waiting_list_for_freed_slot

from .mixins import StaffPermissionMixin
from .models import Appointment, WaitingListEntry
from .serializers import AppointmentRescheduleSerializer
from .serializers_staff import (
    StaffAppointmentCreateSerializer,
    StaffAppointmentSerializer,
    StaffAppointmentUpdateSerializer,
    StaffWaitingListSerializer,
)
from .services import calculate_cancellation_fee


def _staff_appointment_queryset():
    return Appointment.objects.select_related("patient").prefetch_related("procedures")


def _filter_appointments(queryset, request):
    qs = queryset
    date_str = request.query_params.get("date")
    if date_str:
        try:
            qs = qs.filter(appointment_date=date.fromisoformat(date_str))
        except ValueError:
            pass

    status_filter = request.query_params.get("status")
    if status_filter:
        qs = qs.filter(status=status_filter)

    search = request.query_params.get("search", "").strip()
    if search:
        qs = qs.filter(
            Q(patient__email__icontains=search)
            | Q(patient__first_name__icontains=search)
            | Q(patient__last_name__icontains=search)
        )

    patient_id = request.query_params.get("patient_id")
    if patient_id:
        try:
            qs = qs.filter(patient_id=int(patient_id))
        except (TypeError, ValueError):
            pass
    return qs


class StaffAppointmentListCreateView(StaffPermissionMixin, generics.ListCreateAPIView):
    staff_permissions = {
        "GET": "appointments.view",
        "POST": "appointments.create",
    }

    def get_serializer_class(self):
        if self.request.method == "POST":
            return StaffAppointmentCreateSerializer
        return StaffAppointmentSerializer

    def get_queryset(self):
        return _filter_appointments(_staff_appointment_queryset(), self.request)

    def create(self, request, *args, **kwargs):
        serializer = StaffAppointmentCreateSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        appointment = serializer.save()
        return Response(
            StaffAppointmentSerializer(appointment).data,
            status=status.HTTP_201_CREATED,
        )


class StaffAppointmentDetailView(StaffPermissionMixin, generics.RetrieveUpdateAPIView):
    staff_permissions = {
        "GET": "appointments.view",
        "PATCH": "appointments.update",
        "PUT": "appointments.update",
    }

    def get_serializer_class(self):
        if self.request.method in ("PATCH", "PUT"):
            return StaffAppointmentUpdateSerializer
        return StaffAppointmentSerializer

    def get_queryset(self):
        return _staff_appointment_queryset()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = StaffAppointmentUpdateSerializer(
            instance,
            data=request.data,
            partial=partial,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(StaffAppointmentSerializer(instance).data)


class StaffAppointmentCancelView(StaffPermissionMixin, APIView):
    staff_permissions = {"POST": "appointments.delete"}

    def post(self, request, pk):
        try:
            appointment = _staff_appointment_queryset().get(pk=pk)
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
        return Response(StaffAppointmentSerializer(appointment).data)


class StaffAppointmentRescheduleView(StaffPermissionMixin, APIView):
    staff_permissions = {"POST": "appointments.update"}

    def post(self, request, pk):
        try:
            appointment = _staff_appointment_queryset().get(pk=pk)
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
        return Response(StaffAppointmentSerializer(appointment).data)


class StaffScheduleView(StaffPermissionMixin, APIView):
    staff_permissions = {"GET": "appointments.view"}

    def get(self, request):
        date_str = request.query_params.get("date")
        if not date_str:
            return Response(
                {"detail": "date query parameter is required (YYYY-MM-DD)."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            schedule_date = date.fromisoformat(date_str)
        except ValueError:
            return Response(
                {"detail": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        appointments = (
            _staff_appointment_queryset()
            .filter(appointment_date=schedule_date)
            .exclude(status=Appointment.Status.CANCELLED)
            .order_by("start_time")
        )
        return Response(
            {
                "date": schedule_date.isoformat(),
                "appointments": StaffAppointmentSerializer(appointments, many=True).data,
            }
        )


class StaffWaitingListView(StaffPermissionMixin, generics.ListAPIView):
    staff_permissions = {"GET": "appointments.view"}
    serializer_class = StaffWaitingListSerializer

    def get_queryset(self):
        qs = WaitingListEntry.objects.filter(is_active=True).select_related(
            "patient"
        ).prefetch_related("procedures")
        search = self.request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(patient__email__icontains=search)
                | Q(patient__first_name__icontains=search)
                | Q(patient__last_name__icontains=search)
            )
        return qs


class StaffWaitingListDeactivateView(StaffPermissionMixin, APIView):
    staff_permissions = {"POST": "appointments.update"}

    def post(self, request, pk):
        try:
            entry = WaitingListEntry.objects.select_related("patient").get(
                pk=pk,
                is_active=True,
            )
        except WaitingListEntry.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        entry.is_active = False
        entry.save(update_fields=["is_active"])
        return Response(StaffWaitingListSerializer(entry).data)


class StaffWaitingListBookView(StaffPermissionMixin, APIView):
    staff_permissions = {"POST": "appointments.create"}

    def post(self, request, pk):
        try:
            entry = (
                WaitingListEntry.objects.select_related("patient")
                .prefetch_related("procedures")
                .get(pk=pk, is_active=True)
            )
        except WaitingListEntry.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        procedure_ids = list(entry.procedures.values_list("id", flat=True))
        if not procedure_ids:
            return Response(
                {"detail": "Waiting list entry has no procedures."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payload = {
            "patient_id": entry.patient_id,
            "procedure_ids": procedure_ids,
            "appointment_date": request.data.get("appointment_date"),
            "start_time": request.data.get("start_time"),
            "booking_type": request.data.get("booking_type", "pencil"),
            "notes": request.data.get("notes") or entry.notes,
        }
        serializer = StaffAppointmentCreateSerializer(
            data=payload,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        appointment = serializer.save()
        entry.is_active = False
        entry.save(update_fields=["is_active"])
        return Response(
            StaffAppointmentSerializer(appointment).data,
            status=status.HTTP_201_CREATED,
        )
