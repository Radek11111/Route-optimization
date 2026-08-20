[🇬🇧 English](./SCHEMA.md) | 🇵🇱 Polski

# Schemat bazy danych — optymalizacja-trasy

PostgreSQL (Neon), zarządzany przez Prisma. Zobacz [`ARCHITECTURE.md`](./ARCHITECTURE.pl.md) po opis tego, jak to się wpisuje w ogólny przepływ danych.

## Przegląd relacji

```
Route 1───N Point (relacja "RoutePoints")
Route 1───1 Point (relacja "RouteDepot", opcjonalny wskaźnik na depot)
Route 1───N Solution
Solution 1───N VehicleRoute
VehicleRoute 1───N RouteStop
RouteStop N───1 Point
Solution 1───N UnassignedPoint
UnassignedPoint N───1 Point
```

## Modele

### `Route`

Centralna encja reprezentująca jedno zadanie optymalizacji: depot, zestaw punktów dostawy, konfigurację flot i ograniczenia pracy/jazdy.

| Pole | Typ | Uwagi |
|---|---|---|
| `id` | `String` (uuid) | primary key |
| `name`, `description` | `String?` | |
| `status` | `RouteStatus` | `DRAFT` / `READY` / `ARCHIVED`, domyślnie `DRAFT` |
| `vehicleCount` | `Int` | domyślnie `1` |
| `userId` | `String` | **zwykły string, bez foreign key** — patrz uwaga poniżej |
| `depotPointId` | `String?` (unique) | opcjonalny wskaźnik na `Point` będący depot |
| `workStartMinutes`, `workEndMinutes` | `Int` | okno pracy dziennej, w minutach od północy |
| `maxWorkDurationMinutes` | `Int` | |
| `breakAfterMinutes`, `breakDurationMinutes` | `Int?` | uproszczona reguła przerwy (zastąpiona przez penalty przepisów UE w rzeczywistym liczeniu kosztu, zostawiona do podstawowej walidacji ograniczeń) |
| `returnToDepot` | `Boolean` | domyślnie `false` |
| `ratePerKm` | `Float?` | używane do liczenia `estimatedPrice` |

**Uwaga o `userId`:** celowo **nie ma lokalnej tabeli `User` i żadnego foreign key** na tym polu. Tożsamość użytkownika należy w całości do Clerka; `userId` to ID użytkownika z Clerka zapisane jako zwykły string. To świadome uproszczenie (patrz notatki z implementacji auth) — kosztem integralności referencyjnej na poziomie bazy i automatycznego kaskadowego usuwania przy usunięciu użytkownika, unikamy problemu synchronizacji między Clerkiem a lokalną tabelą. Sprawdzanie własności zasobu odbywa się w warstwie aplikacji (każdy handler API weryfikuje `route.userId === auth().userId`), nie na poziomie bazy.

Indeksy: `userId`, `depotPointId`.

### `Point`

Pojedyncza lokalizacja: przystanek dostawy albo (jeśli wskazany przez `Route.depotPointId`) depot.

| Pole | Typ | Uwagi |
|---|---|---|
| `id` | `String` (uuid) | primary key |
| `routeId` | `String` | FK → `Route`, `onDelete: Cascade` |
| `latitude`, `longitude` | `Float` | |
| `name` | `String?` (255) | |
| `serviceTimeMinutes` | `Int` | domyślnie `0` |
| `priority` | `Int` | domyślnie `1` |
| `timeWindowStart`, `timeWindowEnd` | `Int?` | minuty od północy |

Indeks: `routeId`.

### `Solution`

Jeden wynik optymalizacji dla `Route`. Trasa może mieć wiele rozwiązań w czasie (re-optymalizacje); zwykle pokazywane jest tylko najnowsze, ale historia jest zachowana.

| Pole | Typ | Uwagi |
|---|---|---|
| `id` | `String` (uuid) | primary key |
| `routeId` | `String` | FK → `Route`, `onDelete: Cascade` |
| `totalCost` | `Float` | surowy koszt z solvera (nie wartość walutowa — patrz [`SOLVER.md`](./SOLVER.pl.md)) |
| `feasible` | `Boolean` | |
| `status` | `SolutionStatus` | `PENDING` / `PROCESSING` / `COMPLETED` / `FAILED` |
| `travelTime`, `workTimePenalty`, `timeWindowPenalty`, `returnToDepotPenalty`, `priorityPenalty` | `Float` | składowe rozbicia kosztu |
| `naiveDistanceKm`, `savedDistanceKm`, `savedPercent` | `Float?` / `Int?` | porównanie z trasą naiwną (nieoptymalizowaną) |
| `totalDistanceKm`, `estimatedPrice` | `Float?` | przeliczone jednostki rzeczywiste (patrz zasada izolacji solvera) |

> **Znany brak:** penalty za przepisy UE o czasie jazdy (`drivingRulesPenalty`, z `calculateDrivingRulesPenalty`) jest liczone i wliczane do `totalCost` w momencie rozwiązywania, ale **nie ma** obecnie własnej, zapisywanej kolumny na tym modelu — jest wliczone w `totalCost`, ale nie rozbite do wyświetlenia/analizy tak jak inne składowe penalty. Warto dodać kolumnę `drivingRulesPenalty`, jeśli to rozbicie ma być pokazywane w UI.

Indeks: `routeId, createdAt`.

### `VehicleRoute`

Trasa jednego pojazdu w ramach `Solution` — uporządkowana sekwencja przystanków (patrz `RouteStop`).

| Pole | Typ | Uwagi |
|---|---|---|
| `id` | `String` (uuid) | primary key |
| `solutionId` | `String` | FK → `Solution`, `onDelete: Cascade` |
| `vehicleIndex` | `Int` | pozycja we flocie (liczona od 0) |
| `totalServiceTime`, `totalTravelTime`, `totalWorkTime` | `Float?` | |
| `feasible` | `Boolean?` | |
| `totalDistanceKm`, `estimatedPrice` | `Float?` | |

Unique constraint: `(solutionId, vehicleIndex)`. Indeks: `solutionId`.

### `RouteStop`

Jeden przystanek w ramach `VehicleRoute`, w porządku odwiedzania.

| Pole | Typ | Uwagi |
|---|---|---|
| `id` | `String` (uuid) | primary key |
| `vehicleRouteId` | `String` | FK → `VehicleRoute`, `onDelete: Cascade` |
| `pointId` | `String` | FK → `Point`, `onDelete: Cascade` |
| `order` | `Int` | pozycja w trasie pojazdu, liczona od 0 |

Indeksy: `pointId`, `vehicleRouteId`.

### `UnassignedPoint`

Punkt, którego solver nie zdołał umieścić w żadnej trasie pojazdu dla danego `Solution`.

| Pole | Typ | Uwagi |
|---|---|---|
| `id` | `String` (uuid) | primary key |
| `solutionId` | `String` | FK → `Solution`, `onDelete: Cascade` |
| `pointId` | `String` | FK → `Point`, `onDelete: Cascade` |
| `reason` | `String?` | obecnie niewypełniane przez solver — patrz uwaga poniżej |

Unique constraint: `(solutionId, pointId)`. Indeks: `solutionId`.

> **Znany brak:** pole `reason` istnieje w schemacie, ale solver obecnie nie zapisuje czytelnego wyjaśnienia *czemu* punkt został nieprzypisany (np. "brak pojemności pojazdu", "poza oknami czasowymi wszystkich pojazdów"). To jest na roadmapie — patrz [`ARCHITECTURE.md`](./ARCHITECTURE.pl.md).

## Enumy

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

## Uwaga o migracjach

- Używaj `directUrl` (połączenie non-pooled do Neona) do `prisma migrate dev` / `prisma migrate deploy` — advisory locks Prismy (używane do koordynacji równoległych migracji) nie działają przez pooler połączeń Neona.
- Używaj pooled `DATABASE_URL` do zapytań w runtime.
