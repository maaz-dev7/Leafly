# Leafly — Pitch Deck Fact Sheet

Compiled 2026-11-14 by reading the code in this repo and running the app locally.
Everything below is traceable to a file and line. Where a number could not be
verified, it says so rather than guessing.

---

## 1. Tech stack (real, from package manifests)

| Layer | What it actually is |
|---|---|
| Monorepo | pnpm workspaces, Node.js 24, TypeScript 5.9 (`pnpm-workspace.yaml`, `package.json`) |
| Frontend | React 19.1 + Vite 7, Tailwind CSS 4, Radix UI / shadcn components, Wouter routing, TanStack Query 5, Framer Motion, Zustand (`artifacts/leafly/package.json`) |
| Backend | Express 5 on Node, bundled with esbuild to a single CJS file (`artifacts/api-server/package.json`, `build.mjs`) |
| Database | PostgreSQL 16, Drizzle ORM 0.45 + drizzle-kit (`lib/db/`, `.replit` module `postgresql-16`) |
| Validation | Zod, `drizzle-zod` generated insert schemas (`lib/db/src/schema/*.ts`) |
| API contract | OpenAPI spec as source of truth → Orval codegen for typed React hooks and Zod types (`lib/api-spec/openapi.yaml`, `lib/api-client-react/`, `lib/api-zod/`) |
| Auth | JWT (`jsonwebtoken`), bcryptjs password hashing, 7-day token expiry (`artifacts/api-server/src/lib/auth.ts`) |
| Email | nodemailer over Gmail SMTP with an App Password (`artifacts/api-server/src/lib/mailer.ts`) |
| File storage | Google Cloud Storage via Replit Object Storage (`artifacts/api-server/src/lib/objectStorage.ts`) |
| Hosting | Replit — autoscale deployment target, `deploymentTarget = "autoscale"` (`.replit`) |

Honest framing for a deck: this is a **typed, contract-first monorepo** — the
OpenAPI spec generates both the client hooks and the validation schemas, so the
frontend and backend cannot drift apart silently. That is a genuinely strong
engineering story.

### Environment variables the app actually reads
| Variable | Required? | Used for |
|---|---|---|
| `DATABASE_URL` | **Required** | Postgres connection (`lib/db/drizzle.config.ts`) |
| `ADMIN_PASSWORD` | **Required** — server refuses to boot without it | Admin login (`routes/admin.ts:24-27`) |
| `ADMIN_USERNAME` | Optional, defaults to `admin` | Admin login (`routes/admin.ts:23`) |
| `SESSION_SECRET` | Optional — **falls back to a hardcoded string** | JWT signing (`lib/auth.ts:3`) |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Optional | Order + verification emails; no-ops if unset |
| `REPLIT_DEV_DOMAIN` | Optional | Builds links inside emails (`routes/orders.ts:101`) |
| `PORT`, `BASE_PATH` | Required by frontend + API | Vite and Express both throw without `PORT` |
| `PUBLIC_OBJECT_SEARCH_PATHS`, `PRIVATE_OBJECT_DIR` | Optional | Object storage paths |

---

## 2. Pages and features

### Customer-facing pages (`artifacts/leafly/src/App.tsx:62-86`)
| Route | Page |
|---|---|
| `/` | Home — hero, city-based recommendations, category grid, featured plants, why-Leafly, CTA |
| `/shop` | Plant catalogue with search + filters |
| `/shop/accessories` | Accessories catalogue, tabbed by type |
| `/plant/:id` | Plant detail — add-on price calculator, colour variants, 3 info tabs |
| `/shop/accessory/:id` | Accessory detail |
| `/hire` | Hire a Pro — 4 services + booking form |
| `/cart` | Cart + checkout (name/phone/address, COD or card) |
| `/dashboard` | Customer plant-care dashboard |
| `/orders` | Order list with a 4-stage tracking bar + lookup by order ID |
| `/login`, `/signup`, `/forgot-password` | Auth, incl. emailed 6-digit codes |
| `/contact` | Contact page, details served from the DB |

### Admin pages (`App.tsx:77-84`)
`/admin` dashboard · `/admin/plants` · `/admin/accessories` · `/admin/orders` ·
`/admin/bookings` · `/admin/variants` · `/admin/contact` · `/admin/login`

### API surface (`artifacts/api-server/src/routes/`)
12 route modules: `plants`, `addons`, `variants`, `orders`, `bookings`, `care`,
`auth`, `users`, `admin`, `storage`, `contact`, `health`. All mounted under
`/api` (`app.ts:31`).

### Features verified working end to end (DB → API → UI)

Each of these was exercised against a real local Postgres during the screenshot
run on 2026-11-14 — not just read in the source.
1. **Plant catalogue + filtering** — category, city-climate, difficulty, price, text search.
2. **Accessories catalogue** — 4 types: pots, fertilisers, tools, grow lights.
3. **Add-on price calculator** on the plant page — live total = plant + selected add-ons (`plant/[id].tsx:95-97`).
4. **Colour variants** — separate `variants` table, surfaced on the plant page (Adenium only, `plant/[id].tsx:31`).
5. **Cart + checkout** with city-based delivery fee, COD or card flag.
6. **Order tracking** — 4 stages, customer-visible progress bar.
7. **Hire a Pro bookings** — 4 services, booking reference, admin status management.
8. **Plant care dashboard** — watering schedule, computed health status, water/fertilise actions.
9. **Auth** — signup with emailed verification code, login, password reset by code, JWT sessions.
10. **Admin panel** — full CRUD on plants, accessories, variants; order and booking status; editable site contact info.
11. **Image upload** to object storage from the admin panel.

### Notable architecture decisions (good deck material)
- Card number/CVV are collected client-side for UX only and **never sent to or stored on the server** — only a `paymentMethod` flag persists. Keeps the project entirely out of PCI scope (`replit.md`).
- Hire-a-Pro bookings deliberately carry **no delivery fee** (service is on-site).
- Footer contact info lives in a `contact_settings` DB table, so admin edits survive restarts and redeploys.

---

## 3. Product data (from code)

### Plant categories — 5
`Indoor`, `Outdoor`, `Succulents`, `Flowering`, `Air-Purifying`
(`shop/index.tsx:13`, `home.tsx:13-19`)

### Accessory types — 4
Pots & Planters (`pot`), Soil & Fertilisers (`fertilizer`), Tools & Gadgets
(`tool`), Grow Lights (`light`) — `shop/accessories.tsx:11-17`

### Difficulty levels — 3
`Easy`, `Medium`, `Hard` (`lib/db/src/schema/plants.ts`, default `Easy`)

### Hire a Pro — 4 services and their prices (`hire/index.tsx:11-60`)
| Service | Price as shown on the site |
|---|---|
| Gardener | Rs. 500/hr |
| Landscaper | from Rs. 5,000 |
| Plant Decorator | Rs. 2,500/room |
| Plant Consultant | Rs. 800/session |

These prices are **hardcoded in the frontend**, not in the database — they are
display copy, not managed inventory.

### Delivery fees (`routes/orders.ts:20-26`)
| Destination | Fee |
|---|---|
| Lahore | Rs. 250 |
| Everywhere else | Rs. 400 |

### Delivery times (`routes/orders.ts:29-36`)
| City | Estimate |
|---|---|
| Lahore | 2–4 working days |
| Islamabad | 3–5 working days |
| Karachi | 4–6 working days |
| All other cities | 7–9 working days |

### City-climate matching (`routes/plants.ts:15-22`)
Six cities have climate-tag profiles used to recommend plants: Lahore, Karachi,
Islamabad, Peshawar, Multan, Rawalpindi.

### Order statuses — 4 (`orders/index.tsx:10`)
`Confirmed` → `Packed` → `Out for Delivery` → `Delivered`

### Catalogue size
**There is no seed script and no seed data anywhere in this repo** (verified by
searching every `.ts`, `.tsx`, `.sql`, `.json`, `.mjs` and `.sh` file). The
entire catalogue is database-driven and created through the admin panel. A
fresh install starts with **0 plants and 0 accessories** — confirmed: a clean
local database returned an empty catalogue on first boot.

Any real catalogue count must come from the live production database — see
section 5.

> **The catalogue in the screenshots is demo data, not your real catalogue.**
> To produce usable screenshots, a local-only demo catalogue was created
> through the app's own admin API: **14 plants** across all 5 categories,
> **10 accessories** across all 4 types, and **4 Adenium colour variants**.
> It lives only in a throwaway local Docker database. Nothing was written to
> production, and no app code or tracked file was changed. Do not quote
> "14 plants" as a business number.

---

## 4. Placeholder / unsupported claims currently shown on the live site

Listed, not changed, as requested. These are hardcoded display values with no
data behind them — worth knowing before they go on a projector in front of
investors who may ask.

| Claim | Where | Status |
|---|---|---|
| **"Pakistan's #1 Plant Delivery Platform"** | `artifacts/leafly/src/pages/home.tsx:54` | Hardcoded hero badge. No market-share or ranking source exists. This is the single riskiest line to show investors — it is an unverifiable superlative claim. |
| **"500+ Plant varieties"** | `artifacts/leafly/src/pages/home.tsx:111` | Hardcoded. The catalogue is DB-driven with no seed data; the real count is whatever the admin has added. |
| **"20k+ Happy customers"** | `artifacts/leafly/src/pages/home.tsx:111` | Hardcoded. Real figure = row count in `users` / `orders`. |
| **"7-day Guarantee"** | `artifacts/leafly/src/pages/home.tsx:111` | Hardcoded. No returns, refunds or replacement logic exists anywhere in the codebase. |
| **"Happiness Guarantee — we'll replace your plant within 7 days, no questions asked"** | `artifacts/leafly/src/pages/home.tsx:25` | Hardcoded copy. No replacement/returns feature is implemented. |
| **"Expert Care Support — real gardeners available to help you keep every plant healthy after delivery"** | `artifacts/leafly/src/pages/home.tsx:24` | Hardcoded copy. There is no chat, ticketing or support feature in the app; the nearest real thing is the Hire-a-Pro booking form. |
| **"Nationwide Delivery … safe, secure packaging guaranteed"** | `artifacts/leafly/src/pages/home.tsx:23` | Delivery *estimates* are real (routes/orders.ts), but "nationwide" is aspirational — only 4 cities have specific estimates and only Lahore has a distinct fee. |
| **"Curated for Pakistan — every plant is selected for Pakistan's diverse climates"** | `artifacts/leafly/src/pages/home.tsx:22` | Partly real: a 6-city climate-tag matcher does exist (`routes/plants.ts:15-22`). |

### Related gap worth knowing (not a marketing claim, a real bug)
The shop city filter offers **7 cities** — Lahore, Karachi, Islamabad,
Peshawar, Quetta, Multan, Faisalabad (`shop/index.tsx:14`) — but the API only
has climate profiles for **6**, and Quetta and Faisalabad are not among them
(`routes/plants.ts:15-22`). Selecting either silently returns the unfiltered
catalogue instead of a filtered one, because the filter is skipped when no tag
profile is found (`routes/plants.ts:57-60`). Don't demo those two cities.

### Security note (fix before any real launch, not deck material)
`SESSION_SECRET` falls back to the hardcoded string `"leafly-secret-fallback"`
if the env var is unset (`artifacts/api-server/src/lib/auth.ts:3`). If that env
var is not set in production, JWTs are signable by anyone who reads this repo.

---

## 5. Production deployment and real usage numbers

### Deployed URL
Not definitively recorded anywhere in the repo. The only hardcoded production
URL is an email-template fallback:

- `https://leafly.replit.app` — `artifacts/api-server/src/routes/orders.ts:102`

At runtime the app prefers `https://${REPLIT_DEV_DOMAIN}/leafly`, so the real
published address depends on the Replit deployment's domain, which is held in
Replit's config rather than in the code. The git remote is a local backup
mirror (`git://gitsafe:5418/backup.git`), not a hosting provider. The frontend
is served under the `/leafly` path prefix in production.

**Treat `leafly.replit.app` as unconfirmed** — check the Replit "Deployments"
tab for the actual URL.

### Production numbers
production numbers: not collected

No production database credentials were provided, so no usage figures were
read. **Read these off your live admin dashboard** (`/admin` on the deployed
site), which already displays exactly the needed figures — total plants, total
orders, total bookings, total users and total revenue
(`routes/admin.ts:51-65`).

Figures to capture from there for the deck:
- total users
- total orders, and orders broken down by status
- total order revenue (PKR)
- total Hire-a-Pro bookings, and bookings by service
- plants in catalogue
- date of first and most recent order

---

## 6. Screenshots delivered

All in `pitch-assets/screenshots/`, PNG, captured with Playwright/Chromium at
`deviceScaleFactor: 2` with fonts and images fully loaded and toasts dismissed.

| File | Page | Pixels | Viewport |
|---|---|---|---|
| `01-home-hero.png` | Homepage, top of page | 2880×1800 | 1440×900 @2× |
| `02-shop.png` | Shop — plant grid + all filters, "14 plants" | 2880×1800 | 1440×900 @2× |
| `03-plant-detail.png` | Money Plant — add-on selected, price recalculated, care tabs | 2880×4454 | 1440 wide, full page |
| `04-hire-a-pro.png` | Hire a Pro — all four services | 2880×1800 | 1440×900 @2× |
| `05-care-dashboard.png` | Care dashboard — 3 plants, 3 health states | 2880×1800 | 1440×900 @2× |
| `06-order-tracking.png` | Orders — 4-stage tracking bar at "Out for Delivery" | 2880×1800 | 1440×900 @2× |
| `07-admin-dashboard.png` | Admin overview — totals and revenue | 2880×1800 | 1440×900 @2× |
| `08-admin-plants.png` | Admin Plant Manager — full catalogue table | 2880×1800 | 1440×900 @2× |
| `09-mobile-home.png` | Homepage on phone | 780×1688 | 390×844 @2× |
| `10-mobile-plant.png` | Plant detail on phone | 780×1688 | 390×844 @2× |

`03-plant-detail.png` was captured full-page because the add-on price
calculator and the care tabs do not fit in one 900px-tall viewport; crop it to
whichever half the slide needs.

### Caveats for the deck
- Every figure visible in `05`, `06`, `07` and `08` is **local demo data**, not real trading data. The admin dashboard in `07` shows Rs. 6,250 revenue from 2 test orders.
- Plant photos reuse the five category images shipped in `artifacts/leafly/public/`, so the same photo repeats across plants in a category (most visible in the shop grid). Swapping in real product photography would noticeably improve `02` and `08`.
- Accessory thumbnails in `03` render as grey `80 × 80` placeholder tiles. That is the app's real fallback (`shop/accessories.tsx:19-24`) when an accessory has no uploaded image — the demo accessories have none.

---

## 7. Running this project on a Mac — two real blockers

Worth recording; neither is a bug in the app, but both stop a fresh clone from
starting on macOS.

1. **The workspace excludes all non-Linux native binaries.** `pnpm-workspace.yaml`
   sets `@rollup/rollup-darwin-*`, `@esbuild/darwin-*`, `lightningcss-darwin-*`
   and `@tailwindcss/oxide-darwin-*` to `"-"` with the comment "replit uses
   linux-x64 only". On a Mac, Vite dies immediately with
   `Cannot find module @rollup/rollup-darwin-x64`. For this run the four macOS
   binaries were placed into `node_modules` directly, leaving every project
   file untouched.
2. **The frontend has no dev proxy for `/api`.** The React app calls relative
   `/api/...` paths and never sets a base URL (`lib/api-client-react/src/custom-fetch.ts`),
   while Vite's config defines no `server.proxy`. In production Replit's path
   router joins them; locally nothing does, so every API call 404s. This run
   used a small standalone reverse proxy outside the repo. A permanent fix
   would be a `server.proxy` entry in `artifacts/leafly/vite.config.ts`.

Local stack used for the screenshots: PostgreSQL 16.16 in Docker on port 5433,
API server on 8090, Vite on 23134, proxy on 4173. All stopped afterwards.
