# AI Career Copilot Authentication and Supabase Email Setup

The app uses **email + password authentication**. Normal login does not send an email.

## Why Supabase may still send emails

Supabase can send emails during:
- new-account confirmation, if **Confirm email** is enabled
- password reset
- email address changes

The built-in Supabase email service is intended for development/testing and is heavily rate limited. Repeated tests with invalid addresses can also create bounced-email warnings.

## Development setup

If this is only local development and you do not need email verification yet:

1. Open Supabase Dashboard.
2. Go to **Authentication → Providers → Email**.
3. Turn **Confirm email** OFF.
4. Save.

With confirmation disabled, `signUp()` returns a session immediately and the app can send the new user to `/dashboard` without sending a confirmation email.

Use real email addresses for any password-reset tests. Do not repeatedly test with fake/nonexistent addresses.

## Production setup (recommended)

For a public deployment, use a **custom SMTP provider** instead of Supabase's built-in email sender.

Supabase Dashboard:

**Authentication → Emails → SMTP Settings**

Configure an SMTP provider such as Resend, Postmark, SendGrid, AWS SES, or another reputable SMTP service.

Before sending production email:

1. Verify your sending domain with the SMTP provider.
2. Configure SPF and DKIM as instructed by the provider.
3. Configure DMARC when appropriate.
4. Use a dedicated sender such as `no-reply@yourdomain.com`.
5. Keep **Confirm email ON** for production if you want verified accounts.
6. Enable CAPTCHA/attack protection for public signup and recovery flows.
7. Test only with valid addresses that you control.

## Important

Changing the application from OTP to password authentication removes email delivery from **normal login**. It does not remove email delivery from signup confirmation or password reset. Those are controlled by Supabase Auth settings.

The current app already uses `signInWithPassword()` for login and `signUp()` with an email/password for registration.
