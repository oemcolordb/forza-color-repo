## 2024-06-20 - Adding Accessibility Labels to Icon Buttons
**Learning:** Icon-only buttons or dynamic indicators (like tags and selected state indicators) frequently miss necessary `aria-label` and `aria-pressed` attributes. Adding these attributes significantly improves screen reader functionality for users with visual impairments by making the elements and actions clearly readable.
**Action:** When creating interactable elements, especially those indicating toggles or containing only an icon, ensure the appropriate ARIA tags are applied (`aria-label`, `aria-pressed`, `aria-expanded`).
