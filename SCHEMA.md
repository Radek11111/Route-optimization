🇬🇧 English | [🇵🇱 Polski](./SCHEMA.pl.md)

# Database Schema — optymalizacja-trasy

PostgreSQL (Neon), managed via Prisma. See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for how this fits into the overall data flow.

## Entity relationship overview

```
Route 1───N Point (via "RoutePoints")
Route 1───1 Point (via "RouteDepot", optional depot pointer)
Route 1───N Solution
Solution 1───N VehicleRoute
VehicleRoute 1───N RouteStop
RouteStop N───1 Point
Solution 1───N UnassignedPoint
UnassignedPoint N───1 Point
```

## Models

### `Route`

The central entity representing one optimization job: a depot, a set of delivery points, a fleet configuration, and work/driving constraints.

| Field | Type | Notes |
|---|---|---|
| `id` | `String` (uuid) | primary key |
| `name`, `description` | `String?` | |
| `status` | `RouteStatus` | `DRAFT` / `READY` / `ARCHIVED`, default `DRAFT` |
| `vehicleCount` | `Int` | default `1` |
| `userId` | `String` | **plain string, no foreign key** — see note below |
| `depotPointId` | `String?` (unique) | optional pointer to the depot `Point` |
| `workStartMinutes`, `workEndMinutes` | `Int` | daily work window, in minutes from midnight |
| `maxWorkDurationMinutes` | `Int` | |
| `breakAfterMinutes`, `breakDurationMinutes` | `Int?` | legacy simple break rule (superseded by EU driving-rule penalties for actual cost calculation, kept for basic constraint checks) |
| `returnToDepot` | `Boolean` | default `false` |
| `ratePerKm` | `Float?` | used to compute `estimatedPrice` |

**Note on `userId`:** there is intentionally **no local `User` table and no foreign key** on this field. User identity is owned entirely by Clerk; `userId` is Clerk's user ID stored as a plain string. This was a deliberate simplification (see the auth implementation notes) — it trades away database-level referential integrity and automatic cascade-delete-on-user-removal for avoiding a sync problem between Clerk and a local table. Ownership checks are enforced in the application layer (every API handler verifies `route.userId === auth().userId`) rather than at the database level.

Indexes: `userId`, `depotPointId`.

### `Point`

A single location: either a delivery stop or (if referenced by `Route.depotPointId`) the depot.

| Field | Type | Notes |
|---|---|---|
| `id` | `String` (uuid) | primary key |
| `routeId` | `String` | FK → `Route`, `onDelete: Cascade` |
| `latitude`, `longitude` | `Float` | |
| `name` | `String?` (255) | |
| `serviceTimeMinutes` | `Int` | default `0` |
| `priority` | `Int` | default `1` |
| `timeWindowStart`, `timeWindowEnd` | `Int?` | minutes from midnight |

Index: `routeId`.

### `Solution`

One optimization result for a `Route`. A route can have multiple solutions over time (re-optimizations); only the latest is typically shown, but history is preserved.

| Field | Type | Notes |
|---|---|---|
| `id` | `String` (uuid) | primary key |
| `routeId` | `String` | FK → `Route`, `onDelete: Cascade` |
| `totalCost` | `Float` | raw solver cost (not a currency value — see [`SOLVER.md`](./SOLVER.md)) |
| `feasible` | `Boolean` | |
| `status` | `SolutionStatus` | `PENDING` / `PROCESSING` / `COMPLETED` / `FAILED` |
| `travelTime`, `workTimePenalty`, `timeWindowPenalty`, `returnToDepotPenalty`, `priorityPenalty` | `Float` | cost breakdown components |
| `naiveDistanceKm`, `savedDistanceKm`, `savedPercent` | `Float?` / `Int?` | comparison against a naive (unoptimized) route |
| `totalDistanceKm`, `estimatedPrice` | `Float?` | post-processed, real-world units (see solver isolation principle) |

> **Known gap:** the driving-rules penalty (`drivingRulesPenalty`, from `calculateDrivingRulesPenalty`) is computed and included in `totalCost` at solve time, but does **not** currently have its own persisted column on this model — it's folded into `totalCost` but not broken out for display/analysis the way the other penalty components are. Worth adding a `drivingRulesPenalty` column if this breakdown needs to be shown in the UI.

Index: `routeId, createdAt`.

### `VehicleRoute`

One vehicle's route within a `Solution` — an ordered sequence of stops (see `RouteStop`).

| Field | Type | Notes |
|---|---|---|
| `id` | `String` (uuid) | primary key |
| `solutionId` | `String` | FK → `Solution`, `onDelete: Cascade` |
| `vehicleIndex` | `Int` | position in the fleet (0-based) |
| `totalServiceTime`, `totalTravelTime`, `totalWorkTime` | `Float?` | |
| `feasible` | `Boolean?` | |
| `totalDistanceKm`, `estimatedPrice` | `Float?` | |

Unique constraint: `(solutionId, vehicleIndex)`. Index: `solutionId`.

### `RouteStop`

One stop within a `VehicleRoute`, in visiting order.

| Field | Type | Notes |
|---|---|---|
| `id` | `String` (uuid) | primary key |
| `vehicleRouteId` | `String` | FK → `VehicleRoute`, `onDelete: Cascade` |
| `pointId` | `String` | FK → `Point`, `onDelete: Cascade` |
| `order` | `Int` | 0-based position within the vehicle's route |

Indexes: `pointId`, `vehicleRouteId`.

### `UnassignedPoint`

A point that the solver could not fit into any vehicle's route for a given `Solution`.

| Field | Type | Notes |
|---|---|---|
| `id` | `String` (uuid) | primary key |
| `solutionId` | `String` | FK → `Solution`, `onDelete: Cascade` |
| `pointId` | `String` | FK → `Point`, `onDelete: Cascade` |
| `reason` | `String?` | not currently populated by the solver — see note below |

Unique constraint: `(solutionId, pointId)`. Index: `solutionId`.

> **Known gap:** the `reason` field exists on the schema but the solver does not currently write a human-readable explanation for *why* a point was left unassigned (e.g. "no vehicle capacity left", "outside all vehicles' time windows"). This is on the roadmap — see [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Enums

```prisma
enum RouteStatus {
  DRAFT
  READY
  ARCHIVED
}

enum SolutionStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

## Migrations note

- Use `directUrl` (the non-pooled Neon connection string) for `prisma migrate dev` / `prisma migrate deploy` — Prisma's advisory locks (used to coordinate concurrent migrations) don't work through Neon's connection pooler.
- Use the pooled `DATABASE_URL` for runtime queries.
