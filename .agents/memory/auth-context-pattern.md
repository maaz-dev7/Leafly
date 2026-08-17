---
name: Auth state — React Context pattern
description: Why useAuth must be a React Context provider, not useState or Zustand
---

## Rule
Auth state (`token`, `adminToken`) must live in a single React Context (`AuthProvider`) mounted inside the wouter `Router` in `App.tsx`. All components call `useAuth()` which reads from that shared context.

## Why
- **Plain `useState` in a hook** — each component that calls `useAuth()` gets its own isolated state. Calling `login()` in the signup page updates only that component; the Layout's copy never changes so the navbar stays stale.
- **Zustand store + `useLocation` in same hook** — Zustand uses `useSyncExternalStore` internally. Combining it with wouter's `useLocation` in the same `useAuth()` function changes the hook call order between renders, triggering React's "Rules of Hooks" violation and a crash.
- **React Context** — one provider at the tree root, all consumers re-render together whenever `setToken` is called. Works correctly with `useLocation` because the provider holds the location hook, not individual consumers.

## How to apply
- `src/lib/auth.ts` — exports `AuthContext` (created with `createContext`) and `useAuth()` (reads context, throws if outside provider)
- `src/lib/auth-provider.tsx` — exports `AuthProvider` with `useState` for token/adminToken and `useLocation` for post-logout navigation
- `src/App.tsx` — wraps the entire router tree in `<AuthProvider>` inside `<WouterRouter>` (must be inside Router so `useLocation` works)
