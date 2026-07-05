---
name: Orval hook queryKey requirement
description: Generated Orval react-query hooks in this repo need an explicit queryKey option, or typecheck fails.
---

When calling a generated `use*` query hook (e.g. `useListOrders`, `useGetOrder`) with a `query` options object (e.g. `enabled`, `retry`), TypeScript requires `queryKey` to also be present in that options object — it is not inferred automatically in this codebase's Orval output.

**Why:** The generated hook signatures type `query` options against `UseQueryOptions<...>` which marks `queryKey` as required, not optional, once you pass any options object at all.

**How to apply:** Whenever passing a second argument to a generated query hook, import and pass the matching `get<HookName>QueryKey(...)` helper as `queryKey` in the options. This has recurred across dashboard, home, plant detail, orders list, and order-by-id lookups.
