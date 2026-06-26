from django.conf import settings
from rest_framework.response import Response
from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    """Return JSON for API errors instead of Django HTML debug pages."""
    response = exception_handler(exc, context)
    if response is not None:
        return response

    if settings.DEBUG:
        detail = f"{type(exc).__name__}: {exc}"
    else:
        detail = "Server error. Please try again later."

    return Response({"detail": detail}, status=500)
