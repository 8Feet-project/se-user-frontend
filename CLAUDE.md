# CLAUDE.md — 8Feet Frontend

Developer guide for AI assistants working on this codebase.

---

## Project Overview

**8Feet** is a commercial intelligence research platform. This repository is the frontend SPA — a React 18 + TypeScript + Vite application that provides workflows for research task creation, AI-driven analysis, report viewing, and team collaboration.

The UI is bilingual (Chinese/English labels); Chinese text in the UI is expected and correct.

---

## Tech Stack

| Concern | Tool |
|---|---|
| Framework | React 18 |
| Language | TypeScript 5 (strict mode) |
| Build tool | Vite 5 |
| Routing | React Router DOM 6 |
| Styling | Tailwind CSS 3 + tailwind-merge + clsx |
| UI primitives | shadcn components built on Radix UI |
| Icons | lucide-react |
| Font | Geist (variable, via @fontsource-variable/geist) |
| E2E tests | Playwright (installed, no test files yet) |
| Container | Docker + Nginx |

---

## Development Commands

```bash
npm run dev        # Start dev server on http://localhost:4173
npm run build      # tsc type-check then Vite production build
npm run preview    # Preview built output
```

There is **no linter or formatter configured**. TypeScript strict mode is the primary code quality gate — always run `npm run build` to catch type errors before committing.

---

## Environment Variables

Create `.env.local` (gitignored) in the project root:

```env
# Toggle mock API vs real backend (default: true)
VITE_USE_MOCK=false

# Backend base URL (default: same origin, proxied through Nginx)
VITE_API_BASE_URL=http://your-api-domain.com
```

All env vars must be prefixed `VITE_` and are accessed via `import.meta.env.VITE_*`.

---

## Directory Structure

```
src/
├── api/
│   ├── http.ts          # Low-level fetch wrapper (auth headers, URL building)
│   ├── client.ts        # 70+ typed API functions; switches mock/real via VITE_USE_MOCK
│   └── mock.ts          # Comprehensive mock data (~1300 lines) for all endpoints
├── components/
│   ├── common/
│   │   └── PageShell.tsx  # Shared page layout: sidebar + header + main content
│   └── ui/               # shadcn/Radix primitives (button, input, dialog, etc.)
├── pages/                # One file per route (11 pages)
├── routes/
│   └── AppRoutes.tsx     # React Router route table
├── types/
│   └── index.ts          # All TypeScript interfaces for API contracts (~636 lines)
├── lib/
│   └── utils.ts          # cn() helper (clsx + tailwind-merge)
├── App.tsx               # Root component — renders <AppRoutes />
├── main.tsx              # Entry point — React root with <BrowserRouter>
└── index.css             # Tailwind directives + CSS variables + component layer styles
```

---

## Routing

Defined in `src/routes/AppRoutes.tsx`. All unknown paths fall back to `/`.

| Path | Page | Purpose |
|---|---|---|
| `/` | TaskLaunchPage | Create and manage research tasks |
| `/process` | TaskProcessPage | Monitor live task workflow |
| `/report` | ReportPreviewPage | View, export, and share reports |
| `/history` | HistoryFavoritesPage | Historical tasks with saved items |
| `/favorites` | FavoritesPage | Favorite folders and items management |
| `/alerts` | AlertsMessagesPage | Alerts and system messages |
| `/profile` | ProfilePage | User profile settings |
| `/login` | LoginPage | Authentication |
| `/register` | RegisterPage | New account creation |
| `/reset-password` | ResetPasswordPage | Password recovery |
| `/platform-init` | PlatformInitPage | First-run platform setup |

---

## Architecture Patterns

### Page Components

Each page is a single file in `src/pages/`. Pages:

- Manage their own local state with `useState`
- Fetch data in `useEffect` using `Promise.allSettled()` for concurrent requests
- Import API functions directly from `src/api/client.ts`
- Use `PageShell` for consistent layout

```tsx
// Typical page data-fetching pattern
useEffect(() => {
  const load = async () => {
    const [aResult, bResult] = await Promise.allSettled([
      getFoo(),
      getBar(),
    ]);
    if (aResult.status === 'fulfilled') setFoo(aResult.value);
    if (bResult.status === 'fulfilled') setBar(bResult.value);
  };
  load();
}, []);
```

### No Global State

There is no Redux, Zustand, or Context API. State lives at the page component level. Authentication tokens are stored in `localStorage`:

- `access_token` — Bearer token injected into every API request
- `refresh_token` — For token refresh

### PageShell Layout

All authenticated pages wrap their content with `PageShell`:

```tsx
<PageShell title="任务中心" subtitle="Optional description" action={<Button>...</Button>}>
  {/* page content */}
</PageShell>
```

`PageShell` renders the left sidebar (7 nav items), the page header, and the main content card. It uses `useLocation` to highlight the active nav item.

---

## API Layer

### http.ts — Low-level fetch

- All requests go through `request<T>(path, options?, query?)` 
- Automatically injects `Authorization: Bearer <token>` from `localStorage`
- API prefix: `/api/v1`
- Unwraps `ApiResponse<T>` envelope: throws if `code !== 0`
- Base URL set via `VITE_API_BASE_URL` (defaults to same origin)

### client.ts — High-level functions

- One exported async function per API endpoint
- When `VITE_USE_MOCK=true` (default), returns data from `mock.ts` instead of calling the network
- All return types are defined in `src/types/index.ts`

### Adding a new API call

1. Add the request/response interfaces to `src/types/index.ts`
2. Add a mock implementation in `src/api/mock.ts`
3. Export a new function from `src/api/client.ts` that branches on `VITE_USE_MOCK`

---

## TypeScript Conventions

- **Strict mode is on** — no implicit `any`, full null checks
- All component props are explicitly typed inline (no separate interface unless reused)
- API contracts live exclusively in `src/types/index.ts`
- Path alias `@/` maps to `src/` — use it for all non-relative imports beyond one level

```ts
// Prefer
import { cn } from '@/lib/utils';
// Over
import { cn } from '../../lib/utils';
```

---

## Styling Conventions

### Tailwind-first

Write all styles as Tailwind utility classes. Use the `cn()` helper from `@/lib/utils` to merge conditional classes:

```tsx
import { cn } from '@/lib/utils';

<div className={cn('base-class', isActive && 'active-class', className)} />
```

### Component Variants (CVA)

`Button` uses `class-variance-authority` for variant/size combinations. Follow this pattern when adding variants to a component.

### Custom CSS layers

`src/index.css` defines semantic component classes in `@layer components`:

- `.card`, `.glass-card` — container surfaces
- `.section-title`, `.section-desc` — typography
- `.field-label`, `.field-input` — form elements
- `.button-primary`, `.button-secondary` — button shortcuts

Prefer Tailwind utilities directly. Only add to `@layer components` for patterns used across 3+ unrelated locations.

### CSS Variables

Theme colours and radius are defined as CSS variables on `:root` (HSL format) in `index.css` and referenced in `tailwind.config.ts`. When changing the design system, update both.

---

## Component Conventions

- **Functional components only** — no class components
- **Named exports** — every component uses `export function Foo`
- Use `React.forwardRef` when the component needs to expose a DOM ref (see `Button`)
- UI primitives live in `src/components/ui/` — do not add business logic there
- Shared layout/structural components live in `src/components/common/`
- Page-specific sub-components can live inline in the page file if small, or be extracted to a `components/` subfolder if they grow

---

## Testing

- Playwright is installed for E2E tests but **no tests exist yet**
- There is no unit testing framework (no Vitest/Jest)
- Development relies on mock data (`src/api/mock.ts`) for manual UI testing
- When adding new features, update `mock.ts` so the mock mode stays functional

---

## Deployment

The app is containerised. The Dockerfile builds the Vite output and serves it via Nginx.

- `nginx.conf` proxies `/api/` requests to the backend service
- Static assets are served from the Vite `dist/` directory
- All non-API routes serve `index.html` (SPA fallback)

---

## Git Workflow

Active development branch for AI-assisted changes: `claude/add-claude-documentation-Od4OC`

```bash
# Push changes
git push -u origin claude/add-claude-documentation-Od4OC
```

Commit messages follow the conventional format used in this repo:
```
feat: short imperative description
```
