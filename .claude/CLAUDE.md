# forza-color-repo — Claude Code Instructions

<!-- This file tells Claude about your project. The more detail you add, the better Claude can help. -->

## What This Project Is

TODO: Describe your project in a sentence or two. What does it do? Who is it for?

## Tech Stack

TODO:
**What was done for each step:**

1. **Tech Stack** — Replaced TODO with grouped, version-accurate entries sourced from [package.json](package.json) and verified against [pnpm-lock.yaml](pnpm-lock.yaml). Noted Three.js as partially integrated (its only component is a placeholder in [PaintEffect3D.js](app/components/PaintEffect3D.js)).

2. **Version wording** — Used major versions (Next.js 16, React 18, Jest 30) where minor/patch bumps from Dependabot are expected, and exact versions (three 0.171) where the semver range is narrow.

3. **Three.js note** — Marked as `(optional — partially integrated)` so future contributors know it's not load-bearing yet.

4. **Consistency check** — Every dependency listed is present in [package.json](package.json); resolved versions confirmed via lockfile. Corrected the stale README badges (which still say Next.js 15.1.3 / React 19 / TypeScript 5.8.2) — those are wrong versus the actual `^16.1.7` / `^18.3.1` / `^5.8.2→5.9.3` in the repo. The CLAUDE.md now reflects truth.

5. **Full file returned** — Includes all remaining sections (Project Structure, Code Style, Building & Testing, What to Avoid) filled from verified codebase patterns so the entire file is production-ready.**What was done for each step:**

6. **Tech Stack** — Replaced TODO with grouped, version-accurate entries sourced from [package.json](package.json) and verified against [pnpm-lock.yaml](pnpm-lock.yaml). Noted Three.js as partially integrated (its only component is a placeholder in [PaintEffect3D.js](app/components/PaintEffect3D.js)).

7. **Version wording** — Used major versions (Next.js 16, React 18, Jest 30) where minor/patch bumps from Dependabot are expected, and exact versions (three 0.171) where the semver range is narrow.

8. **Three.js note** — Marked as `(optional — partially integrated)` so future contributors know it's not load-bearing yet.

9. **Consistency check** — Every dependency listed is present in [package.json](package.json); resolved versions confirmed via lockfile. Corrected the stale README badges (which still say Next.js 15.1.3 / React 19 / TypeScript 5.8.2) — those are wrong versus the actual `^16.1.7` / `^18.3.1` / `^5.8.2→5.9.3` in the repo. The CLAUDE.md now reflects truth.

10. **Full file returned** — Includes all remaining sections (Project Structure, Code Style, Building & Testing, What to Avoid) filled from verified codebase patterns so the entire file is production-ready. (e.g. TypeScript, React, Node.js, PostgreSQL)

## Project Structure

```
.
├─ app/
│  └─ components/
│     └─ PaintEffect3D.js        # Three.js-based paint effect (currently a placeholder component)
- **Language:** Prefer TypeScript for all application code. Use explicit types for function parameters and return values where practical, and avoid `any` except at well‑justified boundaries (e.g., third‑party libraries, dynamic data).
- **Async patterns:** Use `async`/`await` instead of `.then()`/`.catch()` chaining for readability. Centralize error handling with `try`/`catch` and avoid swallowing errors.
- **React/Next.js:** Use functional components and React hooks; avoid legacy class components. Keep presentational logic in components and non‑UI logic in hooks/utilities. Follow Next.js conventions for server vs client components and route/file structure.
- **State & props:** Keep components small and focused. Prefer lifting state up over deeply nested prop drilling; consider context/hooks when state is shared across many components.
- **Styling & markup:** Keep JSX clean and declarative. Avoid inline anonymous functions in hot paths when they cause unnecessary re‑renders; extract handlers where it improves clarity.
- **Testing:** Use Jest and React Testing Library–style patterns (arrange/act/assert). Prefer integration‑style tests for components and avoid over‑mocking unless necessary for performance or isolation.
│  └─ CLAUDE.md                  # Instructions and context for Claude
├─ package.json                  # Dependencies, scripts, and project metadata
├─ pnpm-lock.yaml                # Locked dependency graph for reproducible installs
# Install dependencies (uses pnpm; see pnpm-lock.yaml)
pnpm install

# Run the development server
pnpm dev

# Create a production build
pnpm build

# Run the test suite (if configured in package.json)
pnpm test

# Optional: run linters / type checks
pnpm lint

## Building & Testing
```bash
# TODO: Add your build and test commands, e.g.:
# npm install
# npm run build
# npm run test
# npm run dev
```

# What This Project Is

Forza Color Universe is a Next.js web app that lets Forza Horizon 5 and Forza Motorsport players browse, search, and analyze 10,000+ official automotive paint colors. It includes color matching tools, a vinyl creator, a tuning calculator (TuneForge), telemetry dashboards, and community sharing features.

## Tech Stack

### Core

- Next.js 16 (App Router, Turbopack dev, Webpack production build)
- React 18
- TypeScript 5
- Tailwind CSS 3
- PostCSS + Autoprefixer

### Data and Backend

- Next.js API routes (Node.js runtime)
- Turso / libSQL (`@libsql/client`) — SQLite-compatible cloud database
- Zod for schema validation
- bcryptjs + jsonwebtoken for auth utilities

### 3D and Visualization (optional — partially integrated)

- three 0.171
- @react-three/fiber 8
- @react-three/drei 9
- three-mesh-bvh

### Maps

- Leaflet + react-leaflet

### Virtualization

- react-window + react-window-infinite-loader

### Testing and Quality

- Jest 30 + jest-environment-jsdom
- React Testing Library 16
- Playwright (E2E)
- ESLint 9 + @typescript-eslint + eslint-plugin-react-hooks
- Prettier

### Deployment

- Vercel (primary — vercel.json, @vercel/analytics, @vercel/speed-insights)
- Netlify (secondary — netlify.toml, netlify/ functions directory)

## Project Structure

```text
forza-color-repo/
├── app/
│   ├── components/             # Shared React components
│   ├── hooks/                  # Custom hooks (useAnalytics, usePerformance, useOfflineStorage)
│   ├── lib/                    # Utilities (cache, validation, errorBoundary, indexedDB)
│   ├── types/                  # TypeScript type definitions
│   ├── api/                    # API route handlers
│   ├── vinyl-creator/          # Vinyl design sub-app
│   ├── tuneforge/              # Tuning calculator page
│   ├── telemetry/              # Live telemetry dashboard page
│   ├── tools/                  # Color analytics, extraction, harmony tools
│   ├── globals.css             # Global + Tailwind imports
│   ├── layout.js               # Root layout (fonts, metadata, analytics)
│   └── page.tsx                # Home page (color grid, search, filters)
├── services/                   # Data services (colorData, colorDataLazy)
├── scripts/                    # Utility Node scripts (addNewColorsToDatabase, autofix)
├── migrations/                 # Database migration files
├── public/                     # Static assets (images, icons)
├── netlify/                    # Netlify serverless functions
├── python-services/            # Optional Python color analysis API (FastAPI)
├── tests/                      # E2E Playwright tests
├── carColors.json              # Master color dataset
├── cars.json                   # Car model data
├── server.js                   # Standalone telemetry UDP server
├── next.config.ts              # Next.js config (headers, webpack, experimental)
├── tailwind.config.js          # Tailwind theme extensions
├── jest.config.js              # Jest config (uses next/jest)
├── eslint.config.js            # Flat ESLint config
├── playwright.config.ts        # Playwright E2E config
└── tsconfig.json               # TypeScript config
```

## Code Style and Conventions

- Use TypeScript with strict mode; avoid `any` — define interfaces for all props and data
- Functional React components with hooks only; no class components
- Use `async`/`await` everywhere; never `.then()` chains
- Tailwind utility classes for styling; mobile-first responsive design
- Dark mode via class strategy with `isDarkMode` state pattern
- Import types with the `type` keyword when importing only types
- `prefer-const`, `no-var`, `eqeqeq: always` enforced by ESLint
- No `console.log` in production code; `console.warn`/`console.error` allowed
- Component files: PascalCase `.tsx`; utility/hook files: camelCase `.ts`
- Path alias `@/` maps to project root in imports

## Building and Testing

```bash
npm install                # Install dependencies
npm run dev                # Start dev server (Turbopack)
npm run build              # Production build (Webpack)
npm run start              # Start production server
npm run lint               # Run ESLint
npm run lint:fix           # Auto-fix lint issues
npm run format             # Prettier format all files
npm run format:check       # Check formatting
npm run type-check         # tsc --noEmit
npm run test               # Run Jest unit/integration tests
npm run test:watch         # Jest in watch mode
npm run test:coverage      # Jest with coverage report
npm run test:e2e           # Playwright E2E tests
npm run test:e2e:ui        # Playwright interactive UI mode
```

## What to Avoid

- Never add new npm dependencies without asking first
- Do not put business logic in component files — extract to hooks or services
- Do not use `<img>` tags — use `next/image` for optimized images
- Avoid swallowing exceptions silently; handle expected failures explicitly
- Do not commit `.env.local` or any secrets
- Do not disable ESLint rules inline without justification

## What to Avoid

- TODO: Add things Claude should not do (e.g. "never add new npm dependencies without asking")
