## 2024-06-28 - Short-circuiting Array Filters
**Learning:** When filtering large arrays like `allColors`, evaluating expensive string operations (e.g., `toLowerCase().includes()`) first for every element can become a severe performance bottleneck.
**Action:** Reorder filter conditions to prioritize exact matches (`===`) and `Set.has()` lookups. Return early when these fast conditions fail, completely skipping the expensive operations for elements that wouldn't pass anyway.
