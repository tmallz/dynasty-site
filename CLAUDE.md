# CLAUDE.md — Dynasty Site

This file documents the codebase for AI assistants. Read it before making changes.

---

## Project Overview

A **SvelteKit-based dynasty fantasy football dashboard** that integrates with the [Sleeper.app](https://sleeper.app) API. It displays league standings, rosters, matchups, draft history, transactions, rivalries, and advanced statistics.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | SvelteKit 2 + Svelte 5 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 + DaisyUI 5 |
| Build | Vite 6 |
| Deployment | Vercel (serverless via `@sveltejs/adapter-vercel`) |
| Unit Tests | Vitest + @testing-library/svelte |
| E2E Tests | Playwright |
| Analytics | @vercel/analytics |

---

## Directory Structure

```
src/
├── app.css                    # Global styles — Tailwind import + DaisyUI theme config
├── app.html                   # Root HTML template
├── app.d.ts                   # Global TypeScript declarations
├── demo.spec.ts               # Example unit test
├── lib/
│   ├── api/
│   │   ├── services/
│   │   │   └── SleeperClient.ts   # All Sleeper API calls (339 lines)
│   │   ├── dtos/                  # Data Transfer Objects
│   │   │   ├── LeagueDtos/        # League, Roster, Matchup, Transaction types
│   │   │   ├── DraftDtos/         # Draft metadata, picks, settings
│   │   │   ├── PlayerDtos/        # Player data, trending players
│   │   │   └── UserDtos/          # User/manager profiles
│   │   └── Enums/                 # TypeScript enums (transaction type/status, draft type/status)
│   ├── Components/                # Reusable Svelte components (by feature)
│   │   ├── drafts/
│   │   ├── homepage/
│   │   ├── matchups/
│   │   ├── navbar/
│   │   ├── resources/
│   │   ├── rivalries/
│   │   ├── rosters/
│   │   ├── standings/
│   │   └── transactions/
│   ├── Stores/                    # Svelte writable stores (one per domain)
│   ├── Utilities/                 # Business logic helpers (named *Helper.ts)
│   └── types/                     # Shared TypeScript types
└── routes/
    ├── +layout.server.ts          # Root server load (league + user data)
    ├── +layout.svelte             # Root layout (navbar, analytics)
    ├── +page.server.ts / +page.svelte   # Homepage
    ├── api/
    │   ├── players/               # GET /api/players (24-hour cache)
    │   ├── matchups/              # GET /api/matchups?week=N
    │   └── transactions/          # GET /api/transactions
    ├── constitution/
    ├── drafts/
    ├── league-stats/
    ├── matchups/
    ├── resources/
    ├── rivalries/
    ├── rosters/
    ├── standings/
    └── transactions/

static/
├── players.json              # Cached NFL player database (17.6 MB)
├── league-stats.json         # Cached league statistics
└── rivalries-data.json       # Cached rivalry data (20 MB)

e2e/                          # Playwright E2E tests
```

---

## Environment Variables

These must be set in `.env` (gitignored). See `.env.example` for reference.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_LEAGUE_ID` | Yes | Sleeper league ID for the dynasty league |
| `VITE_LEAGUE_NAME` | Yes | Display name for the league |
| `VITE_SLEEPER_API_URL` | No | Override Sleeper API base URL (default: `https://api.sleeper.app/v1`) |

---

## Development Commands

```bash
npm run dev           # Start dev server with HMR
npm run build         # Production build
npm run preview       # Preview production build locally
npm run check         # SvelteKit sync + svelte-check (TypeScript validation)
npm run check:watch   # Watch mode type checking
npm run format        # Prettier auto-format all files
npm run lint          # Prettier format check (CI)
npm run test:unit     # Vitest unit + component tests
npm run test:e2e      # Playwright E2E tests (builds first)
npm run test          # All tests (unit + E2E)
```

---

## Architecture Patterns

### Data Flow

```
Sleeper API
    ↓
SleeperClient.ts  (src/lib/api/services/)
    ↓
+layout.server.ts / +page.server.ts  (server-side load functions)
    ↓
SvelteKit props → Client hydrates Svelte stores via $effect
    ↓
Components subscribe to stores with $ prefix
```

### Svelte Stores

All stores live in `src/lib/Stores/`. Each store follows the same pattern:

```ts
export const myStore = writable<MyType | null>(null)
export let isMyStoreLoaded = false

export async function loadMyStore(data: MyType) {
  if (isMyStoreLoaded) return
  myStore.set(data)
  isMyStoreLoaded = true
}
```

- Lazy-loaded once per session using an `isLoaded` boolean flag
- Stores are hydrated client-side from server-loaded data
- Components subscribe using the `$storeName` reactive syntax

### Helper / Utility Classes

Business logic lives in `src/lib/Utilities/` in files named `*Helper.ts`. These are pure TypeScript classes/functions — no Svelte reactivity — that transform raw API data into display-ready formats:

| File | Responsibility |
|------|---------------|
| `LeagueStatsHelper.ts` (728 lines) | Aggregate statistics calculations |
| `TransactionsHelper.ts` (577 lines) | Transaction formatting and filtering |
| `RivalriesHelper.ts` (488 lines) | Head-to-head rivalry tracking |
| `MatchupHelper.ts` (423 lines) | Matchup data processing |
| `HomepageHelper.ts` (266 lines) | Homepage aggregations |
| `StandingsHelper.ts` (218 lines) | League standings/rankings |
| `DraftsHelper.ts` (182 lines) | Draft data processing |
| `RostersHelper.ts` | Roster organization |
| `PodiumHelper.ts` | Winner/podium position calculations |

### API Caching

The `/api/players` endpoint caches data for 24 hours:
- In development: caches to `static/players.json`
- In production: caches to `/tmp/players.json`
- Falls back gracefully when cache is stale or missing

### Server API Routes

All API routes are in `src/routes/api/`:
- `GET /api/players` — Returns NFL player database (cached 24h)
- `GET /api/matchups?week=N` — Matchup data for a specific week (week param required)
- `GET /api/transactions` — League transaction history

---

## Styling Conventions

- **Tailwind CSS 4** utility classes directly in Svelte templates
- **DaisyUI 5** component classes: `btn`, `badge`, `card`, `navbar`, `modal`, etc.
- Responsive design uses Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Theme support via `theme-change` library; configured themes:
  - `light` (default)
  - `autumn`
  - `dark`
  - `synthwave`
- Never write custom CSS unless Tailwind/DaisyUI cannot achieve it; put any custom CSS in `app.css`

---

## Component Conventions

- Components live in `src/lib/Components/<feature>/`
- Each feature directory contains the main component(s) plus a `Skeleton` loading placeholder
- File names use PascalCase: `MatchupCard.svelte`, `TradeTransaction.svelte`
- Page-level components live in `src/routes/` following SvelteKit conventions (`+page.svelte`, `+layout.svelte`)
- Use DaisyUI component classes before reaching for custom styles
- Image elements include fallback `on:error` handlers for missing player/team images

---

## TypeScript Conventions

- Strict mode is enabled — avoid `any` types
- DTOs are organized under `src/lib/api/dtos/` by domain
- Enums live in `src/lib/api/Enums/`
- Page-level types (e.g., `DraftPageDto`, `MatchupPageDto`) aggregate multiple DTOs for the load function return type
- Use `import type` for type-only imports

---

## Testing

### Unit / Component Tests
- Framework: **Vitest** + **@testing-library/svelte**
- Test files: `**/*.spec.ts` or `**/*.test.ts` (co-located with source or in `src/`)
- Svelte component tests: `**/*.svelte.spec.ts` — run in jsdom environment
- Server-side tests: run in node environment
- Setup: `vitest-setup-client.ts` patches `matchMedia` for jsdom

### E2E Tests
- Framework: **Playwright**
- Test files: `e2e/*.test.ts`
- Runs against production build (`npm run build && npm run preview`)
- Currently minimal (only a demo test exists — expand as features stabilize)

---

## Key Third-Party Integrations

### Sleeper API
- Base URL: `https://api.sleeper.app/v1`
- All calls go through `SleeperClient.ts`
- No authentication required (public API)
- Key endpoints used: leagues, rosters, matchups, transactions, drafts, users, players

### Vercel
- Deployed via `@sveltejs/adapter-vercel`
- Analytics via `@vercel/analytics` (included in root layout)
- Serverless functions handle API routes

---

## Common Gotchas

1. **Large static files**: `players.json` and `rivalries-data.json` are 17–20 MB. Do not try to load these synchronously on every request — the caching layer exists for a reason.
2. **Svelte 5 syntax**: This project uses Svelte 5 runes and the new component API (`$props()`, `$state()`, `$effect()`). Do not revert to Svelte 4 syntax.
3. **Node version**: `.npmrc` sets `engine-strict=true`. Check `package.json` `engines` field and match locally.
4. **DaisyUI 5**: The API changed from DaisyUI 4. Refer to DaisyUI 5 docs — some class names differ.
5. **Environment variables prefixed `VITE_`** are exposed to the browser. Server-only secrets must NOT use this prefix.
6. **Stores are session-singletons**: The `isLoaded` flag means stores only load once. If you need fresh data, you must reload the page or reset the flag.

---

## Git Workflow

- Main branch: `main`
- Feature branches: descriptive names or `claude/<feature>-<id>` for AI-generated branches
- Commits: imperative present tense, concise (e.g. `Add rivalry head-to-head sorting`)
- No force-pushing to `main`
