from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from users.permissions import IsPatientUser

from .models import BillingRecord
from .serializers import BillingRecordSerializer


class BillingRecordListView(generics.ListAPIView):
    serializer_class = BillingRecordSerializer
    permission_classes = [IsAuthenticated, IsPatientUser]

    def get_queryset(self):
        return BillingRecord.objects.filter(
            patient=self.request.user
        ).select_related("appointment")
