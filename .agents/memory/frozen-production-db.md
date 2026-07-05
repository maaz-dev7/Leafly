---
name: Frozen production DB masquerades as empty data
description: A user's production Postgres database can be frozen/paused independently of code; this looks identical to a data/query bug from the outside.
---

If a deployed/published app shows empty lists (e.g. no products, no records) but the same queries return data fine in the dev database, check whether the production database has been frozen/paused before assuming a code bug.

**Why:** Spent significant debugging effort on a "missing plants/accessories" report that was actually caused by the production database being frozen at the account level — completely unrelated to any application code. The error surfaces as `PRODUCTION_DATABASE_ERROR: frozen` when queried, not as a generic connection failure, so it's identifiable if you check.

**How to apply:** When a user reports "shows empty" or "no data" specifically on the *published/live* site (not dev), first verify prod DB status via the database skill (`environment: "production"`) before touching query/route code. This is an account-level action only the user can undo (e.g. billing/usage related) — it is not code-fixable.
