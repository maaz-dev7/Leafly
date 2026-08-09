---
name: Framer Motion variant typing
description: Type-safe patterns for custom Framer Motion variants in this workspace.
---

When a Framer Motion variant includes a custom resolver, delay, or easing value, annotate the exported object as `Variants` and use optional chaining around nullable observers.

**Why:** The installed Motion type definitions infer unannotated easing values as plain strings, which causes frontend typecheck failures even though the animation is valid at runtime.

**How to apply:** Import `Variants` from `framer-motion` for shared `revealVariants`/`cardVariants`, and keep browser observers nullable for reduced-motion or unsupported-browser paths.