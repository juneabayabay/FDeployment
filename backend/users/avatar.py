import os

from django.core.exceptions import ValidationError

ALLOWED_AVATAR_CONTENT_TYPES = frozenset(
    {"image/jpeg", "image/png", "image/webp"},
)
ALLOWED_AVATAR_EXTENSIONS = frozenset({".jpg", ".jpeg", ".png", ".webp"})
MAX_AVATAR_BYTES = 5 * 1024 * 1024


def validate_avatar_file(uploaded_file) -> None:
    """Raise ValidationError if the upload is not an allowed avatar image."""
    if not uploaded_file:
        raise ValidationError("No file was submitted.")

    size = getattr(uploaded_file, "size", None)
    if size is None:
        content = uploaded_file.read()
        size = len(content)
        if hasattr(uploaded_file, "seek"):
            uploaded_file.seek(0)
    if size > MAX_AVATAR_BYTES:
        raise ValidationError("Image must be 5 MB or smaller.")

    content_type = getattr(uploaded_file, "content_type", "") or ""
    if content_type not in ALLOWED_AVATAR_CONTENT_TYPES:
        raise ValidationError("Only JPG, PNG, and WebP images are allowed.")

    name = getattr(uploaded_file, "name", "") or ""
    ext = os.path.splitext(name)[1].lower()
    if ext not in ALLOWED_AVATAR_EXTENSIONS:
        raise ValidationError("Only JPG, PNG, and WebP images are allowed.")


def delete_stored_avatar(user) -> None:
    """Remove the user's uploaded avatar file from storage."""
    if user.avatar:
        user.avatar.delete(save=False)
