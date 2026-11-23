# Deploying the Leafly demo to Vercel

A self-contained demo: frontend, API and database all on Vercel + Neon, with no
dependency on Replit. Intended for presentations, not production.

Files added for this: `vercel.json`, `api/[...path].ts`, `demo-data/`.
No existing application code was changed.

---

## 1. Create a GitHub repo and push

This repo currently has **no GitHub remote** — only a local backup mirror
(`gitsafe-backup`). Create the repo on GitHub first (github.com → New
repository → *don't* add a README), then:

```bash
cd /Users/maaz/Downloads/LEAFLY
git add vercel.json api/ demo-data/ DEPLOY.md pitch-assets/
git commit -m "Add Vercel demo deployment config"
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Add the files by name rather than with `git add .` — the working tree also
contains `Claude outputs/Leafly_Speaker_Notes_and_Prep.pdf`, your own speaker
notes, which you probably don't want in a public repo. Skip `pitch-assets/`
too (6.9 MB of screenshots) if you'd rather keep the repo lean.

No secrets are committed — there are no `.env` files in this repo, and all
credentials are set in the Vercel dashboard (step 4).

## 2. Create a free Postgres database

Go to [neon.tech](https://neon.tech) → sign up → create a project.

Copy the **Pooled connection** string (it has `-pooler` in the host). The
pooled one matters: the API opens a `pg` Pool per serverless invocation, and a
direct connection will exhaust the database's connection limit.

It looks like:
```
postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

## 3. Create the tables

From your machine, pointing at the Neon database:

```bash
cd /Users/maaz/Downloads/LEAFLY
export DATABASE_URL="<your Neon pooled connection string>"
pnpm --filter @workspace/db run push
```

## 4. Import the project into Vercel

[vercel.com](https://vercel.com) → **Add New → Project** → import your GitHub repo.

Vercel reads `vercel.json`, so leave the build settings alone. Just add these
**Environment Variables** (Production + Preview):

| Name | Value |
|---|---|
| `DATABASE_URL` | your Neon **pooled** connection string |
| `ADMIN_PASSWORD` | any password you choose — **required**, the API refuses to start without it |
| `SESSION_SECRET` | any long random string (otherwise JWTs are signed with a public fallback value) |
| `ADMIN_USERNAME` | `admin` (optional — this is the default) |

Then **Deploy**. Under Settings → General, set the Node.js version to **22.x**
or newer if it isn't already.

`PORT` and `BASE_PATH` are already supplied by `vercel.json` — the Vite config
throws without them, including at build time.

## 5. Fill the demo with data

Once the deployment is live, point the seed scripts at it:

```bash
export BASE_URL="https://<your-project>.vercel.app"
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD='<the same one you set in Vercel>'

node demo-data/seed.mjs       # 14 plants, 10 accessories, 4 colour variants
node demo-data/testdata.mjs   # customer Ayesha Khan, 3 care plants, 2 orders, 1 booking
```

Both are safe to re-run; they skip anything that already exists.

## 6. Demo credentials

| | |
|---|---|
| Customer | `ayesha.khan@leafly-demo.test` / `DemoPass!2026` |
| Admin | `/admin/login` → `admin` / the `ADMIN_PASSWORD` you set |

---

## What works, and what doesn't

**Works:** catalogue and filters, plant detail with the add-on price
calculator, cart and COD checkout, order tracking, Hire-a-Pro bookings, the
plant-care dashboard, and the full admin panel (plants, accessories, variants,
orders, bookings, contact info).

**Won't work on Vercel — both fine for a demo:**

1. **Admin image upload.** It uses Replit Object Storage through a sidecar at
   `127.0.0.1:1106` (`artifacts/api-server/src/lib/objectStorage.ts`), which
   only exists inside Replit. Uploading an image from the admin panel will
   error. Seeded plants use the images already bundled in the frontend, so the
   catalogue still looks right.
2. **Order confirmation emails.** `GMAIL_USER` / `GMAIL_APP_PASSWORD` aren't
   set, so `sendMail` no-ops. Order creation still succeeds — this is the
   documented behaviour.

**Signup on the live demo:** the signup form emails a verification code, which
won't arrive without Gmail configured. Use the pre-made Ayesha Khan account
above, or add plants via admin.

## Before you present

The homepage shows hardcoded marketing claims with no data behind them —
"Pakistan's #1 Plant Delivery Platform" (`home.tsx:54`), "500+ Plant varieties
/ 20k+ Happy customers / 7-day Guarantee" (`home.tsx:111`). See
`pitch-assets/facts.md` for the full list and the real numbers.

Also avoid demoing the shop's **Quetta** or **Faisalabad** city filters — the
API has no climate profile for either, so they silently return the unfiltered
catalogue (`routes/plants.ts:15-22`).
