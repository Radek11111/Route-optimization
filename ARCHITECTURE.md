🇬🇧 English | [🇵🇱 Polski](./ARCHITECTURE.pl.md)

# Architecture — optymalizacja-trasy

## 1. Overview

The application solves the Vehicle Routing Problem (VRP) and consists of four main layers:

```
┌─────────────────────────────────────────────────────┐
│  UI (Next.js App Router)                            │
│  src/app/dispatcher/...                              │
└───────────────────────┬───────────────────────────────┘
                         │ TanStack Query
┌───────────────────────▼───────────────────────────────┐
│  API (Route Handlers)                                 │
│  src/app/api/routes/...                                │
└───────────────────────┬───────────────────────────────┘
                         │
┌───────────────────────▼───────────────────────────────┐
│  Modules / Services (orchestration)                    │
│  src/modules/optimization/*                             │
│  runOptimizationService, mapPointToDomain,               │
│  mapConstraintsToDomain, optimizeRouteDto                 │
└───────────────────────┬───────────────────────────────┘
                         │
┌───────────────────────▼───────────────────────────────┐
│  Domain / TPS (solver engine — pure algorithm)           │
│  src/domain/tps/*                                        │
│  solver, heuristics, evaluators, engine, penalties        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Infrastructure                                           │
│  Prisma/Neon (database), OSRM (matrix), Nominatim (geocoding) │
└─────────────────────────────────────────────────────────┘
```

Additionally, `src/features/` groups UI/domain code per feature (routes, points, solutions, map) — this is not an architectural layer, just a folder organization by feature.

## 2. Guiding principle: solver isolation

The solver (`domain/tps/solver`, `domain/tps/heuristics`) knows nothing about:

- distances in km (only about a duration/cost matrix passed in from outside),
- pricing (`ratePerKm`, `estimatedPrice`),
- the database, Prisma, or HTTP requests.

The solver operates purely on abstractions: `matrix: number[][]`, `points: Point[]`, `constraints: Constraints`. Its job is to minimize `totalCost` as defined by `routeCostEvaluator` / `solutionCostEvaluator` (work time, time windows, priorities, return to depot).

Converting to kilometers and price is the responsibility of `runOptimizationService` (the modules layer), which:

1. calls the solver with `durationMatrix` (optimizing for time),
2. once a solution is found, computes the real distance from `distanceMatrix` (`sumSolutionDistance`),
3. computes `estimatedPrice = totalDistanceKm * ratePerKm`.

**Consequence of this principle:** if `multiStartSolver` is ever migrated to a Java microservice, the boundary is already defined — the service receives a matrix + points + constraints, and returns a `Solution`. Nothing else is needed.

## 3. Layers — details

### 3.1 Domain / TPS (solver)

- `heuristics/` — `nearestNeighbor`, `nearestNeighborMultiRandom`, `swapOperator`, `relocateOperator`
- `solver/` — `multiStartSolver`, `localSearch`
- `evaluators/` — `routeCostEvaluator`, `solutionCostEvaluator`
- `engine/` — `simulateRoute`, `finalizeSimulation`, `simulationState.factory`
- `penalties/` — `workTime.penalty`, `timeWindow.penalty`, `priority.penalty`, `returnToDepot.penalty`, `drivingRules.penalty` (penalizes cumulative EU driving-rule breaks, `state.totalDrivingRuleBreaks`), all weighted via a shared `penalty.config.ts` (`PENALTIES` constants)
- `utils/` — `isBetterSolution` (**note:** must use `<`, not `<=`, otherwise the `do-while` loop in the operators has no stopping condition)

Style: factory functions with closures, not single-method classes — this is a consistent convention across the whole module.

### 3.2 Modules (optimization)

- `runOptimizationService` — entry point orchestrating the entire optimization flow
- `mappers/` — `mapPointToDomain`, `mapConstraintsToDomain` (Prisma model → domain type)
- `dto/` — `optimizeRouteDto` (domain → response shape)
- `repositories/` — `getRouteForOptimization` (Prisma read)

### 3.3 API

- `GET /api/routes/[id]` — route data
- `GET /api/routes/[id]/solution` — solution data
- `POST /api/routes/[id]/optimize` — triggers `runOptimizationService`, rate-limited per user via Upstash

### 3.4 Infrastructure

- **Prisma/Neon** — `directUrl` used for migrations (advisory locks don't work on the pooler URL)
- **OSRM** — the provider returns `durationMatrix` and `distanceMatrix`; requires `annotations=duration,distance` in the query
- **Nominatim** — address geocoding in the point creation form

## 4. Data flow — generating a route

```
UI (Generate Route)
  → useOptimize (TanStack Query mutation)
  → API route handler
  → runOptimizationService(routeId, matrixProvider)
      → getRouteForOptimization (Prisma)
      → mapPointToDomain / mapConstraintsToDomain
      → matrixProvider.getMatrix (OSRM)
      → multiStartSolver (domain/tps)
      → sumSolutionDistance (post-processing, km)
      → estimatedPrice (post-processing, price)
  → saveFullSolution (Prisma transaction)
  → optimizeRouteDto → response
  → UI updates SolutionPanel
```

## 5. Data model (summary)

`Route` 1—N `Point`, `Route` 1—N `Solution`, `Solution` 1—N `VehicleRoute`, `VehicleRoute` 1—N `RouteStop`, `Solution` 1—N `UnassignedPoint` (with a `reason` field).

Detailed schema description → see [`SCHEMA.md`](./SCHEMA.md).
