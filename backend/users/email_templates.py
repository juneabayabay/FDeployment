from django.conf import settings


def build_password_reset_email(*, recipient_email, recipient_name, reset_link, initiated_by_admin=False):
    """Build subject and bodies for a password-reset confirmation email."""
    clinic_name = "Barnabas Dental Clinic"
    display_name = recipient_name or recipient_email

    if initiated_by_admin:
        intro = (
            f"A clinic administrator requested a password reset for your {clinic_name} "
            f"patient account ({recipient_email})."
        )
    else:
        intro = (
            f"We received a request to reset the password for your {clinic_name} "
            f"patient account ({recipient_email})."
        )

    subject = f"Confirm your {clinic_name} password reset"

    text_body = f"""Hello {display_name},

{intro}

If YOU requested this change, open the link below to confirm and choose a new password:
{reset_link}

This confirmation link expires in 24 hours. Your current password stays active until you complete the reset.

If you did NOT request a password reset, you can safely ignore this email. No changes will be made to your account.

For your security, never share this link with anyone.

— {clinic_name}
"""

    html_body = f"""<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h2 style="color: #0284c7; margin-bottom: 8px;">{clinic_name}</h2>
  <p style="margin-top: 0; color: #64748b;">Password reset confirmation</p>

  <p>Hello <strong>{display_name}</strong>,</p>

  <p>{intro}</p>

  <p><strong>Did you request this?</strong></p>
  <p>If yes, click the button below to confirm and set a new password:</p>

  <p style="text-align: center; margin: 28px 0;">
    <a href="{reset_link}"
       style="background-color: #0284c7; color: #ffffff; padding: 12px 24px;
              text-decoration: none; border-radius: 8px; font-weight: bold;
              display: inline-block;">
      Yes, reset my password
    </a>
  </p>

  <p style="font-size: 13px; color: #64748b;">
    Or copy this link into your browser:<br>
    <a href="{reset_link}" style="color: #0284c7; word-break: break-all;">{reset_link}</a>
  </p>

  <p style="font-size: 13px; color: #64748b;">
    This link expires in 24 hours. Your current password remains unchanged until you finish the reset.
  </p>

  <p style="font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px;">
    If you did <strong>not</strong> request this, ignore this email — your account will stay as it is.
  </p>
</body>
</html>
"""

    return subject, text_body, html_body


def build_email_verification_email(*, recipient_email, recipient_name, verify_link):
    """Build subject and bodies for a new-account email verification message."""
    clinic_name = "Barnabas Dental Clinic"
    display_name = recipient_name or recipient_email

    subject = f"Verify your {clinic_name} patient account"

    text_body = f"""Hello {display_name},

Thank you for registering at {clinic_name}.

Please verify your email address to book appointments online:
{verify_link}

This link expires in 24 hours. You can sign in before verifying, but booking stays disabled until your email is confirmed.

If you did not create this account, you can ignore this email.

— {clinic_name}
"""

    html_body = f"""<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h2 style="color: #0284c7; margin-bottom: 8px;">{clinic_name}</h2>
  <p style="margin-top: 0; color: #64748b;">Verify your email</p>

  <p>Hello <strong>{display_name}</strong>,</p>

  <p>Thank you for registering. Please confirm your email to book appointments online:</p>

  <p style="text-align: center; margin: 28px 0;">
    <a href="{verify_link}"
       style="background-color: #0284c7; color: #ffffff; padding: 12px 24px;
              text-decoration: none; border-radius: 8px; font-weight: bold;
              display: inline-block;">
      Verify my email
    </a>
  </p>

  <p style="font-size: 13px; color: #64748b;">
    Or copy this link into your browser:<br>
    <a href="{verify_link}" style="color: #0284c7; word-break: break-all;">{verify_link}</a>
  </p>

  <p style="font-size: 13px; color: #64748b;">
    This link expires in 24 hours. You may sign in before verifying, but online booking stays disabled until confirmation.
  </p>
</body>
</html>
"""

    return subject, text_body, html_body
