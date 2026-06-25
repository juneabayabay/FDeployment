from django.db import transaction
from django.utils import timezone
from rest_framework import generics, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from appointments.mixins import StaffPermissionMixin
from appointments.serializers_staff import PatientSummarySerializer

from .models import BillingRecord, DownPaymentRequest


class DownPaymentSerializer(serializers.ModelSerializer):
    patient = PatientSummarySerializer(read_only=True)

    class Meta:
        model = DownPaymentRequest
        fields = [
            "id",
            "patient",
            "amount",
            "description",
            "status",
            "reviewed_by",
            "reviewed_at",
            "rejection_reason",
            "billing_record",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "patient",
            "status",
            "reviewed_by",
            "reviewed_at",
            "rejection_reason",
            "billing_record",
            "created_at",
            "updated_at",
        ]


class DownPaymentCreateSerializer(serializers.ModelSerializer):
    patient_id = serializers.IntegerField()

    class Meta:
        model = DownPaymentRequest
        fields = ["patient_id", "amount", "description"]

    def validate_patient_id(self, value):
        from users.models import Role, User

        try:
            user = User.objects.get(pk=value, deleted_at__isnull=True, is_active=True)
        except User.DoesNotExist as exc:
            raise serializers.ValidationError("Patient not found.") from exc
        if not user.user_roles.filter(role__slug=Role.USER).exists():
            raise serializers.ValidationError("Selected user is not a patient account.")
        return value

    def create(self, validated_data):
        from users.models import User

        patient_id = validated_data.pop("patient_id")
        patient = User.objects.get(pk=patient_id)
        return DownPaymentRequest.objects.create(patient=patient, **validated_data)


class DownPaymentListCreateView(StaffPermissionMixin, generics.ListCreateAPIView):
    staff_permissions = {"GET": "billing.view", "POST": "billing.create"}

    def get_serializer_class(self):
        if self.request.method == "POST":
            return DownPaymentCreateSerializer
        return DownPaymentSerializer

    def get_queryset(self):
        qs = DownPaymentRequest.objects.select_related("patient").order_by("-created_at")
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = DownPaymentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        record = serializer.save()
        return Response(
            DownPaymentSerializer(record).data,
            status=status.HTTP_201_CREATED,
        )


class DownPaymentApproveView(StaffPermissionMixin, APIView):
    staff_permissions = {"POST": "billing.approve"}

    @transaction.atomic
    def post(self, request, pk):
        try:
            record = (
                DownPaymentRequest.objects.select_for_update()
                .select_related("patient")
                .get(pk=pk)
            )
        except DownPaymentRequest.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if record.status != DownPaymentRequest.Status.PENDING:
            return Response(
                {"detail": "This request has already been reviewed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        billing = BillingRecord.objects.create(
            patient=record.patient,
            description=record.description or f"Braces down payment #{record.id}",
            total_amount=record.amount,
            amount_paid=record.amount,
        )
        record.status = DownPaymentRequest.Status.APPROVED
        record.reviewed_by = request.user
        record.reviewed_at = timezone.now()
        record.billing_record = billing
        record.save(
            update_fields=[
                "status",
                "reviewed_by",
                "reviewed_at",
                "billing_record",
                "updated_at",
            ]
        )
        return Response(DownPaymentSerializer(record).data)


class DownPaymentRejectView(StaffPermissionMixin, APIView):
    staff_permissions = {"POST": "billing.approve"}

    @transaction.atomic
    def post(self, request, pk):
        try:
            record = (
                DownPaymentRequest.objects.select_for_update()
                .select_related("patient")
                .get(pk=pk)
            )
        except DownPaymentRequest.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if record.status != DownPaymentRequest.Status.PENDING:
            return Response(
                {"detail": "This request has already been reviewed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reason = request.data.get("rejection_reason", "")
        record.status = DownPaymentRequest.Status.REJECTED
        record.reviewed_by = request.user
        record.reviewed_at = timezone.now()
        record.rejection_reason = reason
        record.save(
            update_fields=[
                "status",
                "reviewed_by",
                "reviewed_at",
                "rejection_reason",
                "updated_at",
            ]
        )
        return Response(DownPaymentSerializer(record).data)
