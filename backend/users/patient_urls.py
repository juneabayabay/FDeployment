from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .patient_views import PatientViewSet

app_name = "patients"

router = DefaultRouter()
router.register("", PatientViewSet, basename="patient")

urlpatterns = [
    path("", include(router.urls)),
    path("", include("clinical.urls")),
]
