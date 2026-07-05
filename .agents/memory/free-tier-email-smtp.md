---
name: Free-tier email notification workaround
description: How to send transactional emails (e.g. order confirmations) when third-party OAuth connectors aren't available on the free tier.
---

Replit's native OAuth-based email connectors (Gmail, Resend, SendGrid integrations) require a paid plan. On the free tier, they are not usable.

**Why:** User needed order-confirmation emails but only had free-tier access, ruling out the standard integrations skill flow for Gmail/Resend/SendGrid connectors.

**How to apply:** Use `nodemailer` with plain SMTP auth instead — request `GMAIL_USER` and `GMAIL_APP_PASSWORD` as env secrets via `requestEnvVar` (not the OAuth connector system), then send mail via Gmail's SMTP server. This only requires the user to generate a Gmail App Password (myaccount.google.com/apppasswords, requires 2-Step Verification enabled), not a paid Replit plan.

Make the email send non-blocking and fail gracefully: log a warning/error but do not fail the parent request (e.g. order creation) if SMTP auth fails or credentials are missing/invalid. A `535 5.7.8 Bad Credentials` SMTP error usually means the App Password was mistyped or 2-Step Verification isn't enabled on that account — ask the user to regenerate it rather than assuming a code bug.
