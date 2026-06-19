## 2026-06-19 - Added missing accessibility attributes to Modals
**Learning:** Found several input elements inside modals (like AuthModal) that lacked `id` attributes and matching `htmlFor` on their labels. Additionally, close buttons (icon-only) lacked `aria-label` attributes.
**Action:** When working on form inputs and icon-only buttons in this codebase, actively verify and supply explicit `htmlFor` mappings and `aria-label` respectively, especially in React modal components.
## 2026-06-19 - Migrated GitHub Actions to pnpm
**Learning:** The GitHub actions workflows were still using `npm` even though the codebase uses `pnpm`. This caused issues because `npm ci` was looking for `package-lock.json`, which was not tracked/present.
**Action:** Always ensure GitHub workflows reflect the package manager used in the repo. Utilize `pnpm/action-setup` alongside `actions/setup-node` and replace `npm` commands (`install`, `run`, `test`) with `pnpm`.
