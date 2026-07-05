# Leafly

Leafly is a full-stack smart plant delivery and care platform for Pakistan — customers browse and order plants/accessories, book "Hire a Pro" gardening services, and admins manage inventory, orders, and bookings.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/leafly run dev` — run the web frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Optional env: `GMAIL_USER`, `GMAIL_APP_PASSWORD` — enables order confirmation emails via Gmail SMTP (nodemailer). If unset or invalid, order creation still succeeds; email sending just logs a warning/error and no-ops.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (`artifacts/leafly`)
- API: Express 5 (`artifacts/api-server`)
- DB: PostgreSQL + Drizzle ORM (`lib/db`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec, `lib/api-spec`)
- Build: esbuild (CJS bundle)
- Email: nodemailer + Gmail SMTP (App Password auth)

## Where things live

- `artifacts/leafly/src/pages/` — customer-facing pages (shop, cart, hire-a-pro, orders, admin dashboard)
- `artifacts/api-server/src/routes/` — Express route handlers (orders, bookings, plants, admin, contact)
- `artifacts/api-server/src/lib/mailer.ts` — order email notification sender
- `artifacts/api-server/src/lib/contact-store.ts` — DB-backed contact info (email/phone/address/hours shown in footer)
- `lib/db/src/schema/` — Drizzle schema, source of truth for DB tables
- `lib/api-spec/openapi.yaml` — source of truth for API contracts; run codegen after editing

## Architecture decisions

- Card payment details (number/CVV) are collected client-side only for UX and never sent to or stored on the server — only a `paymentMethod` ("cod" | "online") flag is persisted. This avoids PCI-scope entirely since there's no real payment gateway integration yet.
- Contact info (footer email/phone/address/hours) is stored in a dedicated `contactSettingsTable` in Postgres rather than in-memory, so admin edits persist across server restarts/deploys.
- Hire-a-Pro bookings do not charge a delivery fee (service is performed on-site, not delivered).

## Product

- Browse and order plants/accessories with cart checkout (mandatory name/phone/address, COD or online-card payment method).
- Book gardening/landscaping/plant-decorator services ("Hire a Pro") with address and payment method.
- Admin dashboard for managing plants, accessories, orders, bookings, and site contact info.
- Order confirmation emails sent to the store owner via Gmail SMTP when configured.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The **production** database can be independently frozen/paused by the user outside of code changes. If plants/accessories/data appear empty only on the published site (and work fine in dev), check production DB status first — this is an account-level action only the user can undo, not a code bug.
- Third-party OAuth email connectors (Gmail/Resend/SendGrid via Replit integrations) require a paid plan. On the free tier, use custom SMTP via nodemailer + a Gmail App Password (requested as plain env secrets) instead.
- Do not import `zod/v4` directly in `api-server` routes — esbuild bundling breaks. Use the `drizzle-zod`-generated schemas re-exported from `@workspace/db` instead.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
