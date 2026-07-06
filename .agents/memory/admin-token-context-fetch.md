---
name: Admin auth token selection by URL substring is fragile
description: Leafly's global fetch wrapper picks admin vs customer bearer token by checking if the URL contains "/api/admin" — this breaks for admin-only endpoints that don't live under that path prefix.
---

Some admin-only actions are exposed under resource-based routes rather than
`/api/admin/*` (e.g. `PATCH /api/orders/:id/status`, `PATCH /api/bookings/:id/status`
are `requireAdmin`-gated but the URL has no "/api/admin" substring). A fetch
wrapper that keys token selection purely off a URL substring check will silently
attach the wrong token (or none) for these, causing 401/403s that look like
"the status won't save" or "the dashboard won't load" from the user's side —
while curl-testing the backend directly with an explicit correct token shows
everything working fine.

**Why:** Backend-only verification (curl with a manually supplied token) cannot
catch this class of bug — the bug is entirely in how the frontend decides which
token to attach per-request. Always check the actual client-side auth-header
logic, not just the server route guards, when a user reports admin actions
silently failing.

**How to apply:** Prefer keying token selection off app/page context (e.g.
`window.location.pathname.includes("/admin")`) rather than the request URL's
own path, since the two vocabularies (page section vs. API route naming) can
diverge. When adding new admin-only endpoints under non-`/api/admin` paths,
double check the token-attachment logic covers them.
