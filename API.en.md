# API — optymalizacja-trasy

## 1. General conventions

**Auth.** Every endpoint requires a Clerk session. Two helpers from `shared/utils/require-route-owner`:
- `requireAuth()` — checks only that the user is signed in. Returns `{ ok: true, userId }` or `{ ok: false, response }`.
- `requireRouteOwner(routeId)` — additionally checks that `route.userId === userId` (IDOR protection). Returns `{ ok: true, userId, route }` or `{ ok: false, response }`.

Pattern used in every handler:
```ts
const auth = await requireRouteOwner(id);
if (!auth.ok) return auth.response;
```

**Response shape.** `successResponse(data, status)` → `{ "success": true, "data": ... }`. `errorResponse(message, status)` → `{ "success": false, "message": "..." }`. The `optimize` endpoint uses `NextResponse.json` directly but keeps the same shape.

**Validation.** Zod (`.parse()`) on the request body. A validation error falls into the generic `catch` — most endpoints return a generic message, **not** the Zod error details (see section 4 on this inconsistency).

## 2. Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/routes` | `requireAuth` | Create a route |
| GET | `/api/routes` | `requireAuth` | List the user's routes |
| GET | `/api/routes/[id]` | `requireRouteOwner` | Route details |
| PATCH | `/api/routes/[id]` | `requireRouteOwner` | Partial route update |
| GET | `/api/routes/[id]/points` | `requireRouteOwner` | List route points |
| POST | `/api/routes/[id]/points` | `requireRouteOwner` | Add a point to a route |
| DELETE | `/api/routes/[id]/points/[pointId]` | `requireRouteOwner` (assumed) | Delete a point |
| PUT | `/api/routes/[id]/depot` | `requireRouteOwner` | Set a point as depot |
| POST | `/api/routes/[id]/optimize` | `requireRouteOwner` + rate limit | Run the solver and persist the solution |
| GET | `/api/routes/[id]/solution` | `requireRouteOwner` | Latest solution for a route |

> **Note:** the `DELETE /api/routes/[id]/points/[pointId]` handler wasn't among the files I reviewed — its existence is inferred from the `useDeletePoint` hook (`API_hooks`), which calls `DELETE` on that path. I can't confirm its actual implementation (auth, validation) — verify it yourself and correct this table if needed.

## 3. Endpoint details

### POST /api/routes
Body (`createRouteSchema`):
```ts
{
  name: string;              // 1-255 chars
  description?: string;      // max 1000
  vehicleCount: number;      // int 1-1000
  workStartMinutes: number;
  workEndMinutes: number;
  maxWorkDurationMinutes: number;
  returnToDepot: boolean;
  ratePerKm?: number;
  driverMode: "TRUCK" | "COURIER" | "NONE"; // default TRUCK
  courierBreakAfterMinutes?: number;   // required together with the field below when driverMode=COURIER
  courierBreakDurationMinutes?: number;
}
```
200 → `{ success: true, data: Route }`. 500 → `{ success: false, message: "Failed to create route" }`.

### GET /api/routes
200 → `{ success: true, data: Route[] }` (with `_count.points`, sorted `createdAt desc`).

### GET /api/routes/[id]
200 → `{ success: true, data: Route }` (with `depotPoint`, `_count.points`). 403/404 per `requireRouteOwner`.

### PATCH /api/routes/[id]
Body: `updateRouteSchema` — same shape as `createRouteSchema` but with **every field optional** (`.partial()`), keeping the same courier-mode `refine`. 200 → updated `Route`. 500 → generic error.

### GET /api/routes/[id]/points
200 → `Point[]` (sorted `createdAt asc`).

### POST /api/routes/[id]/points
Body (`createPointSchema`):
```ts
{
  name?: string;             // max 255
  latitude: number;          // -90..90
  longitude: number;         // -180..180
  serviceTimeMinutes: number; // int >= 0
  priority: number;          // int 1-10
  timeWindowStart?: number;  // 0-1440
  timeWindowEnd?: number;    // 0-1440
}
```
200 → created `Point`.

### PUT /api/routes/[id]/depot
Body: `{ pointId: string }`. Checks that the point exists and belongs to the route (`point.routeId === routeId`), otherwise returns **400** with a specific message (`Point not found` / `Point does not belong to the route`) — **this endpoint is the exception to the "generic message" rule**, it returns the actual `error.message`.

### POST /api/routes/[id]/optimize
No body. Flow:
1. `requireRouteOwner`
2. Rate limit (`optimizeRateLimit.limit(userId)`, Upstash sliding window) — on limit exceeded, **429** + `X-RateLimit-Limit` / `X-RateLimit-Remaining` / `X-RateLimit-Reset` headers.
3. `runOptimizationService` — see `SOLVER.md`.
4. `saveOptimizationResultService` — persists `Solution` + `VehicleRoute` + `RouteStop` + `UnassignedPoint` in a single Prisma transaction.
5. 200 → `{ success: true, data: OptimalizationResponseDto }`.

On error (e.g. missing depot, no points, OSRM failure) → a `Solution` with status `FAILED` and `errorMessage` is persisted, then a `500` with `message` is returned — **unlike most endpoints, the raw error content reaches the client here** (see section 4).

### GET /api/routes/[id]/solution
Returns the most recent `Solution` (`orderBy createdAt desc`, `findFirst`) with nested `vehicleRoutes.stops.point` and `unassignedPoints.point`. 404 if no solution has been generated yet.

## 4. Inconsistencies / things to reconsider

1. **Error message exposure is inconsistent.** Most endpoints (`create-route`, `create-point`, `patch route`) return a generic message regardless of the cause — good from a security standpoint (no Prisma/Zod internals leaked). `depot` and `optimize` return `error.message` straight to the client. This is a split in error-handling strategy — pick one approach and apply it consistently (e.g. generic message to the client + full log server-side, always).
2. **No request body size/type validation before `request.json()`** — no handler enforces a request size limit; worth considering for large point counts per route.
3. **Rate limiting only on `optimize`** — other endpoints (e.g. creating points) have no rate limit, which could be a DoS vector against your own database with a large `vehicleCount` / point count.
