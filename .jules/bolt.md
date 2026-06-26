## 2024-05-18 - Fast-fail Array Filtering Optimization
**Learning:** In large arrays (`allColors` with 40k+ items), running `.toLowerCase().includes()` before exact-match and Set lookups (like `color.make === selectedMake` or `favoritesSet.has()`) causes unnecessary allocations and string operations, severely degrading UI filter responsiveness.
**Action:** Always short-circuit array filtering operations by evaluating fast exact-match conditions and O(1) Set lookups before performing expensive string operations.
