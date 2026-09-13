# API — optymalizacja-trasy

## 1. Konwencje ogólne

**Auth.** Każdy endpoint (poza publicznymi, jeśli takie istnieją) wymaga sesji Clerk. Dwa helpery w `shared/utils/require-route-owner`:
- `requireAuth()` — sprawdza tylko, czy użytkownik jest zalogowany. Zwraca `{ ok: true, userId }` lub `{ ok: false, response }`.
- `requireRouteOwner(routeId)` — dodatkowo sprawdza, że `route.userId === userId` (ochrona przed IDOR). Zwraca `{ ok: true, userId, route }` lub `{ ok: false, response }`.

Wzorzec w każdym handlerze:
```ts
const auth = await requireRouteOwner(id);
if (!auth.ok) return auth.response;
```

**Format odpowiedzi.** `successResponse(data, status)` → `{ "success": true, "data": ... }`. `errorResponse(message, status)` → `{ "success": false, "message": "..." }`. Endpoint `optimize` używa `NextResponse.json` bezpośrednio, ale zachowuje ten sam kształt.

**Walidacja.** Zod (`.parse()`) na body requestu. Błąd walidacji wpada do ogólnego `catch` — w większości endpointów zwracany jest generyczny komunikat, **nie** szczegóły błędu Zod (patrz sekcja 4, uwaga o niekonsekwencji).

## 2. Endpointy

| Metoda | Ścieżka | Auth | Opis |
|---|---|---|---|
| POST | `/api/routes` | `requireAuth` | Tworzy trasę |
| GET | `/api/routes` | `requireAuth` | Lista tras użytkownika |
| GET | `/api/routes/[id]` | `requireRouteOwner` | Szczegóły trasy |
| PATCH | `/api/routes/[id]` | `requireRouteOwner` | Częściowa aktualizacja trasy |
| GET | `/api/routes/[id]/points` | `requireRouteOwner` | Lista punktów trasy |
| POST | `/api/routes/[id]/points` | `requireRouteOwner` | Dodaje punkt do trasy |
| DELETE | `/api/routes/[id]/points/[pointId]` | `requireRouteOwner` (zakładane) | Usuwa punkt |
| PUT | `/api/routes/[id]/depot` | `requireRouteOwner` | Ustawia punkt jako depot |
| POST | `/api/routes/[id]/optimize` | `requireRouteOwner` + rate limit | Uruchamia solver i zapisuje rozwiązanie |
| GET | `/api/routes/[id]/solution` | `requireRouteOwner` | Najnowsze rozwiązanie dla trasy |

> **Uwaga:** handler `DELETE /api/routes/[id]/points/[pointId]` nie był w plikach, które przeanalizowałem — jego istnienie wnioskuję z hooka `useDeletePoint` (`API_hooks`), który wywołuje `DELETE` na ten adres. Nie potwierdzam jego rzeczywistej implementacji (auth, walidacja) — sprawdź to sam i ewentualnie popraw tę tabelę.

## 3. Szczegóły endpointów

### POST /api/routes
Body (`createRouteSchema`):
```ts
{
  name: string;              // 1-255 znaków
  description?: string;      // max 1000
  vehicleCount: number;      // int 1-1000
  workStartMinutes: number;
  workEndMinutes: number;
  maxWorkDurationMinutes: number;
  returnToDepot: boolean;
  ratePerKm?: number;
  driverMode: "TRUCK" | "COURIER" | "NONE"; // default TRUCK
  courierBreakAfterMinutes?: number;   // wymagane razem z poniższym, gdy driverMode=COURIER
  courierBreakDurationMinutes?: number;
}
```
200 → `{ success: true, data: Route }`. 500 → `{ success: false, message: "Failed to create route" }`.

### GET /api/routes
200 → `{ success: true, data: Route[] }` (z `_count.points`, sortowane `createdAt desc`).

### GET /api/routes/[id]
200 → `{ success: true, data: Route }` (z `depotPoint`, `_count.points`). 403/404 wg `requireRouteOwner`.

### PATCH /api/routes/[id]
Body: `updateRouteSchema` — to samo co `createRouteSchema`, ale **wszystkie pola opcjonalne** (`.partial()`), z tym samym `refine` na regułę kuriera. 200 → zaktualizowany `Route`. 500 → generyczny błąd.

### GET /api/routes/[id]/points
200 → `Point[]` (sortowane `createdAt asc`).

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
200 → utworzony `Point`.

### PUT /api/routes/[id]/depot
Body: `{ pointId: string }`. Sprawdza, że punkt istnieje i należy do trasy (`point.routeId === routeId`), inaczej `400` z konkretnym komunikatem błędu (`Point not found` / `Point does not belong to the route`) — **ten endpoint jest wyjątkiem od reguły "generyczny komunikat"**, zwraca realny `error.message`.

### POST /api/routes/[id]/optimize
Bez body. Przepływ:
1. `requireRouteOwner`
2. Rate limit (`optimizeRateLimit.limit(userId)`, Upstash sliding window) — przy przekroczeniu **429** + nagłówki `X-RateLimit-Limit` / `X-RateLimit-Remaining` / `X-RateLimit-Reset`.
3. `runOptimizationService` — patrz `SOLVER.md`.
4. `saveOptimizationResultService` — zapis `Solution` + `VehicleRoute` + `RouteStop` + `UnassignedPoint` w jednej transakcji Prisma.
5. 200 → `{ success: true, data: OptimalizationResponseDto }`.

Błąd (np. brak depot, brak punktów, błąd OSRM) → zapisuje `Solution` ze statusem `FAILED` i `errorMessage`, po czym zwraca `500` z `message` — **tu, w przeciwieństwie do większości endpointów, treść błędu trafia bezpośrednio do klienta** (patrz sekcja 4).

### GET /api/routes/[id]/solution
Zwraca najnowszy `Solution` (`orderBy createdAt desc`, `findFirst`) z zagnieżdżonymi `vehicleRoutes.stops.point` i `unassignedPoints.point`. 404, jeśli żadnego rozwiązania jeszcze nie wygenerowano.

## 4. Niekonsekwencje / do rozważenia

1. **Ekspozycja komunikatów błędów jest niekonsekwentna.** Większość endpointów (`create-route`, `create-point`, `patch route`) zwraca generyczny komunikat niezależnie od przyczyny błędu — dobre z punktu widzenia bezpieczeństwa (nie ujawnia szczegółów Prisma/Zod). `depot` i `optimize` zwracają `error.message` bezpośrednio do klienta. To rozjazd w podejściu do error handling — wybierz jedną strategię i zastosuj konsekwentnie (np. generyczny komunikat dla klienta + pełny log po stronie serwera, zawsze).
2. **Brak walidacji rozmiaru/typu body przed `request.json()`** — w żadnym handlerze nie ma limitu wielkości requestu; przy dużej liczbie punktów na trasę warto rozważyć limit.
3. **Rate limiting tylko na `optimize`** — pozostałe endpointy (np. tworzenie punktów) nie mają rate limitu, co przy dużym `vehicleCount`/liczbie punktów może być wektorem DoS na własną bazę.
