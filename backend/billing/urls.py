from django.urls import path

from .views import BillingRecordListView
from .views_down_payment import (
    DownPaymentApproveView,
    DownPaymentListCreateView,
    DownPaymentRejectView,
)
from .views_staff import StaffBillingDetailView, StaffBillingListCreateView

app_name = "billing"

urlpatterns = [
    path("staff/down-payments/", DownPaymentListCreateView.as_view(), name="down-payments"),
    path(
        "staff/down-payments/<int:pk>/approve/",
        DownPaymentApproveView.as_view(),
        name="down-payment-approve",
    ),
    path(
        "staff/down-payments/<int:pk>/reject/",
        DownPaymentRejectView.as_view(),
        name="down-payment-reject",
    ),
    path("staff/", StaffBillingListCreateView.as_view(), name="staff-list-create"),
    path("staff/<int:pk>/", StaffBillingDetailView.as_view(), name="staff-detail"),
    path("", BillingRecordListView.as_view(), name="list"),
]
