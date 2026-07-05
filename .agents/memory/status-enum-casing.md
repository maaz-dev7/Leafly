---
name: Status enum casing mismatch
description: Select/dropdown components must match the exact casing the backend stores for status enums.
---

A Select component's option `value`s must exactly match the casing of the status string stored in the database, or the component will fail to reflect the current selection (it just shows the placeholder/first option, looking "broken" or "not saving").

**Why:** In this codebase, backend status columns are stored lowercase (e.g. `"pending"`), but a UI Select was built with capitalized option values (e.g. `"Pending"`) — since `value` didn't match the underlying data, React never matched an option as selected.

**How to apply:** When building or debugging any status/enum Select tied to a DB-backed field, always lowercase (or otherwise normalize) both the option values and the field's current value before comparing/binding them.
