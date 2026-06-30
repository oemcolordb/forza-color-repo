## 2024-05-18 - Optimized String Operations
**Learning:** Filtering arrays with `.toLowerCase().includes()` is computationally expensive for large arrays. Exact matching first and checking fast lookups avoids executing expensive string operations if not necessary.
**Action:** Reordered filter conditions in `ColorDashboardClient.tsx` to check `matchesMake`, `matchesType`, and `matchesFavorites` before performing the string-based search operations.
