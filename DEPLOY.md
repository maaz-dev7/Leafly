# Deploying the Leafly demo to Vercel + Neon

A self-contained demo: frontend, API, Postgres **and** file storage, with no
dependency on Replit.

Backend services are on Neon (project **Leafly**, `winter-poetry-35657064`,
branch `production`), declared in [`neon.ts`](neon.ts):

- **Lakebase Postgres** — the application database
- **Object Storage** — S3-compatible bucket `assets`, for uploaded plant and
  accessory images

## Files added for deployment

| Path | Purpose |
|---|---|
| `vercel.json` | Build config; supplies `PORT`/`BASE_PATH` (the Vite config throws without them, even at build time) and SPA routing that excludes `/api` |
| `api/[...path].mjs` | Vercel serverless function — re-exports the pre-built API bundle |
| `deploy/entry.ts`, `deploy/build-api.mjs` | Bundles the Express app into `artifacts/api-server/vercel-dist/handler.mjs` |
| `neon.ts`, `.neon` | Neon service declaration and project link |
| `demo-data/` | Scripts that seed a demo catalogue and customer |

Vercel compiles **no TypeScript**: this project uses `moduleResolution: "bundler"`
with a `customConditions: ["workspace"]` export condition, which Vercel's
compiler does not honour. The API is pre-bundled with the project's own esbuild
instead.

---

## 1. Push to GitHub

Already done — https://github.com/maaz-dev7/Leafly. Vercel redeploys on push.

## 2. Pull the Neon environment variables

Already provisioned. To refresh them locally at any time:

```bash
neon env pull        # writes .env.local (gitignored)
```

That file holds `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, and the four `AWS_*`
object-storage variables.

## 3. Create the tables

Use the **unpooled** connection for migrations — Neon's pooled endpoint runs
PgBouncer in transaction mode and breaks session-level DDL:

```bash
set -a && . ./.env.local && set +a
DATABASE_URL="$DATABASE_URL_UNPOOLED" pnpm --filter @workspace/db run push
```

Already applied: all 11 tables exist on the `production` branch.

## 4. Import the project into Vercel

[vercel.com](https://vercel.com) → **Add New → Project** → import
`maaz-dev7/Leafly`. Leave the build settings alone; `vercel.json` drives them.

Add these **Environment Variables** (Production + Preview). The values for the
first and last four come from your `.env.local`:

| Name | Value |
|---|---|
| `DATABASE_URL` | Neon **pooled** string (the one with `-pooler`) |
| `ADMIN_PASSWORD` | your choice — **required**, the API refuses to boot without it |
| `SESSION_SECRET` | any long random string (else JWTs use a public fallback) |
| `AWS_ACCESS_KEY_ID` | from `.env.local` |
| `AWS_SECRET_ACCESS_KEY` | from `.env.local` |
| `AWS_ENDPOINT_URL_S3` | from `.env.local` |
| `AWS_REGION` | from `.env.local` |
| `ADMIN_USERNAME` | `admin` (optional — this is the default) |

Set Node.js to **22.x** or newer under Settings → General.

`PORT` and `BASE_PATH` come from `vercel.json`; don't add them by hand.

## 5. Fill the demo with data

Already seeded on the `production` branch (14 plants, 10 accessories, 4
variants, 1 customer, 2 orders, 1 booking). To re-run against the deployed
site:

```bash
export BASE_URL="https://<your-project>.vercel.app"
export ADMIN_USERNAME=admin ADMIN_PASSWORD='<the one you set in Vercel>'
node demo-data/seed.mjs
node demo-data/testdata.mjs
```

Both skip anything that already exists.

## 6. Demo credentials

| | |
|---|---|
| Customer | `ayesha.khan@leafly-demo.test` / `DemoPass!2026` |
| Admin | `/admin/login` → `admin` / your `ADMIN_PASSWORD` |

---

## Object storage

[`artifacts/api-server/src/lib/objectStorage.ts`](artifacts/api-server/src/lib/objectStorage.ts)
was rewritten from Replit Object Storage to Neon's S3-compatible bucket. The
public API of the module is unchanged, so `routes/storage.ts` works as-is.

- Credentials, endpoint and region come from the standard `AWS_*` env chain.
- `forcePathStyle: true` is required — Neon uses path-style addressing.
- Uploads go straight from the browser to a presigned `PUT` URL.
- Postgres stores a path, not bytes: `/api/storage/objects/uploads/<uuid>`,
  which is directly usable as an `<img src>` and is streamed back by the API.
- The bucket is `private`; every read is proxied by the API, so no credentials
  reach the browser.
- Storage branches with the database, so a Neon branch gets its own copy of
  both the rows and the files they point at.

**Images uploaded on Replit do not carry over.** They live in Replit Object
Storage and are not in this repo or the database. Re-upload them through the
admin panel and they will land in the Neon bucket.

## Rebuilding after backend changes

The serverless bundle is committed, so Vercel serves whatever was last built:

```bash
node deploy/build-api.mjs    # then commit artifacts/api-server/vercel-dist/handler.mjs
```

## Known gaps

- **Order confirmation emails** no-op: `GMAIL_USER` / `GMAIL_APP_PASSWORD` are unset. Order creation still succeeds — documented behaviour.
- **Signup on the live demo** emails a verification code that won't arrive. Use the Ayesha Khan account above, or add data through the admin panel.
- Avoid demoing the shop's **Quetta** or **Faisalabad** city filters — the API has no climate profile for either, so they silently return the unfiltered catalogue (`routes/plants.ts:15-22`).
- The homepage shows hardcoded claims with no data behind them — "Pakistan's #1 Plant Delivery Platform" (`home.tsx:54`), "500+ / 20k+ / 7-day" (`home.tsx:111`). See `pitch-assets/facts.md`.
