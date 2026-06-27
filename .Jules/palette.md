## 2024-11-20 - Ensure Modal Close Buttons Have ARIA Labels
**Learning:** Found multiple instances where close buttons on modals relied solely on an `X` icon (via lucide-react) without any text content, creating an inaccessible element for screen reader users.
**Action:** When working on modals or popup menus in this app, explicitly add an `aria-label` (e.g. `aria-label="Close modal"`) to any icon-only `<button>` tags.
