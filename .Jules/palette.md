## 2024-06-25 - ARIA Labels on Icon Buttons
**Learning:** Found multiple instances of icon-only theme toggle buttons (`☀️` / `🌙`) missing `aria-label` attributes. This is a critical accessibility issue for screen reader users as they have no context for the button's purpose.
**Action:** Always verify that buttons containing only icons or emojis have descriptive `aria-label` attributes. Implemented a fix by adding `aria-label="Toggle theme"` to the theme toggle buttons in `app/tuneforge/page.tsx` and `app/favorites/page.tsx`.
