## 2026-06-19 - Added missing accessibility attributes to Modals
**Learning:** Found several input elements inside modals (like AuthModal) that lacked `id` attributes and matching `htmlFor` on their labels. Additionally, close buttons (icon-only) lacked `aria-label` attributes.
**Action:** When working on form inputs and icon-only buttons in this codebase, actively verify and supply explicit `htmlFor` mappings and `aria-label` respectively, especially in React modal components.
