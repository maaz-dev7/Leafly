---
name: Card payment PCI-safety pattern (no real gateway)
description: How to offer an "online card payment" option in checkout UI without a real payment gateway integration, while staying PCI-safe.
---

When a user wants an "online card payment" checkout option but has no real payment gateway (Stripe/etc.) integrated, collect card number/expiry/CVV fields in the UI for realism, but never transmit or persist them to the server. Only send/store a `paymentMethod` flag (e.g. `"cod" | "online"`).

**Why:** Avoids taking on any PCI-DSS compliance scope, since raw card data never leaves the browser or touches app storage. Suggest a real gateway (Stripe/Whop) if the user wants actual charge processing later — see the `monetization` skill.

**How to apply:** Client-side form validates card fields exist/look well-formed but discards them on submit; only the payment method choice is included in the API request body and persisted in the DB.
