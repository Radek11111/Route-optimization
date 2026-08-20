🇬🇧 English | [🇵🇱 Polski](./README.pl.md)

# Optymalizacja Trasy

A full-stack Vehicle Routing Problem (VRP) solver with time windows (VRPTW), multi-vehicle dispatch, and EU driving regulation compliance (Regulation 561/2006). Built as a portfolio project to explore route optimization heuristics, backend/frontend architecture, and production-grade auth/security patterns.

**Live demo:** [route-optimization-ashy.vercel.app](https://route-optimization-ashy.vercel.app)

## What it does

Given a depot and a set of delivery points, the app computes near-optimal routes for one or more vehicles, respecting:

- Vehicle time windows and per-stop service times
- Maximum daily working time
- EU driving/rest regulations (continuous driving breaks, daily rest — Phase 1)
- Optional return-to-depot requirement

It reports total cost, feasibility, distance/time saved vs. a naive route, and per-vehicle stats (travel time, service time, distance, estimated price).

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript |
| Auth | Clerk |
| Database | PostgreSQL (Neon) via Prisma ORM |
| Rate limiting | Upstash Redis (`@upstash/ratelimit`) |
| Forms & validation | react-hook-form, Zod |
| UI | shadcn/ui, Tailwind CSS |
| Maps | Leaflet, react-leaflet |
| Routing/geocoding | OSRM (public server), Nominatim (OpenStreetMap) |
| Data fetching | TanStack Query |
| Testing | Vitest |
| Deployment | Vercel |

## Architecture highlights

- **Solver isolation:** the optimization engine (`multiStartSolver` → `nearestNeighborMultiRandom` → `localSearch` with relocate/swap operators) works purely on abstract matrices, points, and constraints — it has no knowledge of currency, distance units, HTTP, or the database. All enrichment (pricing, KPIs, persistence) happens after optimization, in the service layer.
- **Layered backend:** Schema/DTO → Repository → Service → Route Handler, with mappers translating between DB records and domain types.
- **Ownership checks on every endpoint:** every route/point/solution API handler verifies the authenticated user owns the resource before reading or mutating it (prevents IDOR).
- **Rate limiting on the optimize endpoint:** sliding-window limiting per user via Upstash Redis, since route optimization is the most compute-intensive operation in the app.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for a deeper breakdown, [`SOLVER.md`](./SOLVER.md) for the optimization algorithm, and [`API.md`](./API.md) for endpoint documentation.

## Getting started locally

### Prerequisites

- Node.js 20+
- A PostgreSQL database (e.g. [Neon](https://neon.tech))
- A [Clerk](https://clerk.com) account (Development instance is fine for local dev)
- An [Upstash](https://upstash.com) Redis database

### Setup

```bash
git clone <repo-url>
cd optymalizacja-trasy
npm install
```

Create `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database (Neon)
DATABASE_URL=postgresql://...          # pooled connection, used at runtime
DIRECT_URL=postgresql://...            # direct connection, used for migrations

# Rate limiting
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Routing
MATRIX_PROVIDER=osrm
OSRM_URL=http://router.project-osrm.org
```

Run migrations and start the dev server:

```bash
npx prisma migrate dev
npm run dev
```

The app runs on [http://localhost:3000](http://localhost:3000).

> **Note:** `npm run dev` runs Next.js with `--webpack`, not the default Turbopack. This project hit a reproducible bug where Turbopack's dev-mode caching interacted badly with Clerk's session token refresh, causing infinite sign-in redirect loops. Webpack is unaffected; production builds (`next build` / `next start`) are unaffected regardless of this flag.

## Known limitations

- **OSRM public server:** routing distances/durations are fetched from the free public OSRM demo server, which has no SLA and informal rate limits. Fine for a portfolio demo; a production deployment would need a self-hosted OSRM instance or a paid provider (e.g. Mapbox, OpenRouteService).
- **EU driving rules — Phase 1 only:** daily driving limits, the 4.5h continuous-driving break rule, and daily rest are implemented. Weekly/biweekly limits and split breaks (15+30 min) are not yet implemented — see [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the roadmap.
- **No user/route ownership sync with an external identity table:** the app relies on Clerk as the sole source of truth for user identity (`Route.userId` is a plain string, not a foreign key) — there is no local `User` table to keep in sync.

## Testing

```bash
npm run test
```

Unit and integration tests cover the solver components (cost evaluators, operators, simulation state) using minimal synthetic data — coordinates are irrelevant to the solver since it only consumes duration/distance matrices.

## License

Personal portfolio project — not licensed for reuse without permission.
