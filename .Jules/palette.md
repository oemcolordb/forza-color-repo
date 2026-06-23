## 2026-06-23 - ARIA labels for icon-only buttons
**Learning:** Icon-only buttons (like the '✕' close button in AuthModal) without text content are not readable by screen readers, making them inaccessible.
**Action:** Always ensure any icon-only button includes a descriptive `aria-label` (e.g. `aria-label="Close modal"`) to meet accessibility standards.
