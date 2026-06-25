from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken


def blacklist_user_tokens(user):
    for outstanding in OutstandingToken.objects.filter(user=user):
        BlacklistedToken.objects.get_or_create(token=outstanding)
