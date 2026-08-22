[🇬🇧 English](./ARCHITECTURE.md) | 🇵🇱 Polski

# Architektura — optymalizacja-trasy

## 1. Przegląd

Aplikacja rozwiązuje problem VRP (Vehicle Routing Problem) i składa się z czterech głównych warstw:

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
│  Modules / Services (orkiestracja)                     │
│  src/modules/optimization/*                             │
│  runOptimizationService, mapPointToDomain,              │
│  mapConstraintsToDomain, optimizeRouteDto                │
└───────────────────────┬───────────────────────────────┘
                         │
┌───────────────────────▼───────────────────────────────┐
│  Domain / TPS (silnik solvera — czysty algorytm)         │
│  src/domain/tps/*                                       │
│  solver, heuristics, evaluators, engine, penalties       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Infrastructure                                          │
│  Prisma/Neon (baza), OSRM (matryca), Nominatim (geokod.)   │
└─────────────────────────────────────────────────────────┘
```

Dodatkowo `src/features/` grupuje kod UI/domenowy per funkcjonalność (routes, points, solutions, map) — nie jest to warstwa w sensie architektonicznym, tylko organizacja folderów po feature'ach.

## 2. Zasada nadrzędna: izolacja solvera

Solver (`domain/tps/solver`, `domain/tps/heuristics`) nie wie nic o:

- odległościach w km (tylko o macierzy czasów/kosztów przekazanej z zewnątrz),
- cenie (`ratePerKm`, `estimatedPrice`),
- bazie danych, Prismie, requestach HTTP.

Solver operuje wyłącznie na abstrakcjach: `matrix: number[][]`, `points: Point[]`, `constraints: Constraints`. Jego zadaniem jest zminimalizować `totalCost` zdefiniowany przez `routeCostEvaluator` / `solutionCostEvaluator` (czas pracy, okna czasowe, priorytety, powrót do depot).

Przeliczanie kilometrów i ceny należy do `runOptimizationService` (warstwa modules), które:

1. wywołuje solver z `durationMatrix` (optymalizacja po czasie),
2. po znalezieniu rozwiązania liczy realny dystans z `distanceMatrix` (`sumSolutionDistance`),
3. przelicza `estimatedPrice = totalDistanceKm * ratePerKm`.

**Konsekwencja tej zasady:** jeśli kiedyś dojdzie migracja `multiStartSolver` do mikroserwisu w Javie, granica jest już wyznaczona — serwis dostaje matrycę + punkty + constraints, oddaje `Solution`, i nic więcej mu nie potrzeba.

## 3. Warstwy — szczegóły

### 3.1 Domain / TPS (solver)

- `heuristics/` — `nearestNeighbor`, `nearestNeighborMultiRandom`, `swapOperator`, `relocateOperator`
- `solver/` — `multiStartSolver`, `localSearch`
- `evaluators/` — `routeCostEvaluator`, `solutionCostEvaluator`
- `engine/` — `simulateRoute`, `finalizeSimulation`, `simulationState.factory`
- `penalties/` — `workTime.penalty`, `timeWindow.penalty`, `priority.penalty`, `returnToDepot.penalty`, `drivingRules.penalty` (penalizuje skumulowane przerwy wynikające z przepisów UE o czasie jazdy, `state.totalDrivingRuleBreaks`), wszystkie ważone przez wspólny `penalty.config.ts` (stałe `PENALTIES`)
- `utils/` — `isBetterSolution` (**uwaga:** musi używać `<`, nie `<=`, inaczej pętla `do-while` w operatorach nie ma warunku stopu)

Styl: factory functions z closures, nie klasy z jedną metodą — to konsekwentna konwencja w całym module.

### 3.2 Modules (optimization)

- `runOptimizationService` — punkt wejścia orkiestrujący cały przepływ optymalizacji
- `mappers/` — `mapPointToDomain`, `mapConstraintsToDomain` (Prisma model → domain type)
- `dto/` — `optimizeRouteDto` (domain → response shape)
- `repositories/` — `getRouteForOptimization` (odczyt z Prisma)

### 3.3 API

- `GET /api/routes/[id]` — dane trasy
- `GET /api/routes/[id]/solution` — rozwiązanie
- `POST /api/routes/[id]/optimize` — wywołuje `runOptimizationService`, limitowany per użytkownik przez Upstash

### 3.4 Infrastructure

- **Prisma/Neon** — `directUrl` do migracji (advisory locks nie działają na pooler URL)
- **OSRM** — provider zwraca `durationMatrix` i `distanceMatrix`; wymaga `annotations=duration,distance` w query
- **Nominatim** — geokodowanie adresów w formularzu punktów

## 4. Przepływ danych — generowanie trasy

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
      → estimatedPrice (post-processing, cena)
  → saveFullSolution (Prisma transaction)
  → optimizeRouteDto → response
  → UI aktualizuje SolutionPanel
```

## 5. Model danych (skrót)

`Route` 1—N `Point`, `Route` 1—N `Solution`, `Solution` 1—N `VehicleRoute`, `VehicleRoute` 1—N `RouteStop`, `Solution` 1—N `UnassignedPoint` (z polem `reason`).

Szczegółowy opis schematu → osobny dokument [`SCHEMA.md`](./SCHEMA.md).
