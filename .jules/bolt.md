## 2026-06-25 - Short-circuiting expensive array filters
**Learning:** When filtering large arrays in React hooks (like `allColors` which contains many car colors), evaluating expensive string operations (`.toLowerCase().includes()`) before fast exact-match or O(1) Set lookups can cause unnecessary performance bottlenecks.
**Action:** Always structure filter conditions to return early on fast checks (e.g. `color.make !== selectedMake`) before executing expensive string manipulations.
