from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    PatientOrthodonticViewSet,
    PatientPrescriptionViewSet,
    PatientSurgicalViewSet,
    PatientTreatmentViewSet,
)

router = DefaultRouter()
router.register(
    r"(?P<patient_pk>[^/.]+)/treatments",
    PatientTreatmentViewSet,
    basename="patient-treatments",
)
router.register(
    r"(?P<patient_pk>[^/.]+)/orthodontic",
    PatientOrthodonticViewSet,
    basename="patient-orthodontic",
)
router.register(
    r"(?P<patient_pk>[^/.]+)/surgical",
    PatientSurgicalViewSet,
    basename="patient-surgical",
)
router.register(
    r"(?P<patient_pk>[^/.]+)/prescriptions",
    PatientPrescriptionViewSet,
    basename="patient-prescriptions",
)

urlpatterns = [
    path("", include(router.urls)),
]
