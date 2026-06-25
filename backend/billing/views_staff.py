from django.db.models import Q
from rest_framework import generics, status
from rest_framework.response import Response

from appointments.mixins import StaffPermissionMixin

from .models import BillingRecord
from .serializers_staff import (
    StaffBillingRecordCreateSerializer,
    StaffBillingRecordSerializer,
    StaffBillingRecordUpdateSerializer,
)


def _staff_billing_queryset():
    return BillingRecord.objects.select_related(
        "patient",
        "appointment",
    )


def _filter_billing(queryset, request):
    qs = queryset
    payment_status = request.query_params.get("payment_status")
    if payment_status:
        qs = qs.filter(payment_status=payment_status)

    search = request.query_params.get("search", "").strip()
    if search:
        qs = qs.filter(
            Q(patient__email__icontains=search)
            | Q(patient__first_name__icontains=search)
            | Q(patient__last_name__icontains=search)
            | Q(description__icontains=search)
        )

    patient_id = request.query_params.get("patient_id")
    if patient_id:
        try:
            qs = qs.filter(patient_id=int(patient_id))
        except (TypeError, ValueError):
            pass
    return qs


class StaffBillingListCreateView(StaffPermissionMixin, generics.ListCreateAPIView):
    staff_permissions = {
        "GET": "billing.view",
        "POST": "billing.create",
    }

    def get_serializer_class(self):
        if self.request.method == "POST":
            return StaffBillingRecordCreateSerializer
        return StaffBillingRecordSerializer

    def get_queryset(self):
        return _filter_billing(_staff_billing_queryset(), self.request)

    def create(self, request, *args, **kwargs):
        serializer = StaffBillingRecordCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        record = serializer.save()
        return Response(
            StaffBillingRecordSerializer(record).data,
            status=status.HTTP_201_CREATED,
        )


class StaffBillingDetailView(StaffPermissionMixin, generics.RetrieveUpdateAPIView):
    staff_permissions = {
        "GET": "billing.view",
        "PATCH": "billing.update",
        "PUT": "billing.update",
    }

    def get_serializer_class(self):
        if self.request.method in ("PATCH", "PUT"):
            return StaffBillingRecordUpdateSerializer
        return StaffBillingRecordSerializer

    def get_queryset(self):
        return _staff_billing_queryset()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = StaffBillingRecordUpdateSerializer(
            instance,
            data=request.data,
            partial=partial,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(StaffBillingRecordSerializer(instance).data)
