from rest_framework.throttling import AnonRateThrottle


class AuthAnonRateThrottle(AnonRateThrottle):
    scope = "auth"
