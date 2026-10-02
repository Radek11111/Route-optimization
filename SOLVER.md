# Solver — optymalizacja-trasy

## 1. Cel

Silnik rozwiązuje wariant VRPTW (Vehicle Routing Problem with Time Windows): przypisuje punkty do pojazdów i wyznacza kolejność odwiedzin tak, by zminimalizować `totalCost` przy uwzględnieniu okien czasowych, maks. czasu pracy, priorytetów, opcjonalnego powrotu do depot oraz (dla trybu `TRUCK`) reguł jazdy UE 561/2006.

Solver nie liczy kilometrów ani ceny — działa wyłącznie na `durationMatrix` (patrz `ARCHITECTURE.md`, sekcja "izolacja solvera").

## 2. Pipeline

```
multiStartSolver (domyślnie 20 iteracji)
  └─ nearestNeighborMultiRandom   → rozwiązanie startowe (randomizowany greedy)
       └─ localSearch (maks. 50 iteracji)
            ├─ relocateOperator   → przenoszenie 1 punktu między/w trasach
            ├─ swapOperator       → wymiana 2 punktów między/w trasach
            └─ twoOpt             → odwrócenie segmentu trasy (per pojazd)
  → zwraca rozwiązanie o najniższym totalCost ze wszystkich iteracji
```

`multiStartSolver` jest odporny na lokalne minima dzięki wielokrotnemu restartowi z innym rozwiązaniem startowym (randomizacja w `nearestNeighborMultiRandom`).

## 3. Heurystyka konstrukcyjna — `nearestNeighborMultiRandom`

Dla każdego pojazdu: z nieodwiedzonych punktów wybiera `randomness` (domyślnie 3) najbliższych względem aktualnej pozycji, losuje jeden z nich. Limit punktów na pojazd: `maxPerVehicle = ceil((pointCount - 1) / vehicleCount)`. Punkty, które się nie zmieściły w żadnym pojeździe, trafiają do `unassigned`.

To jest **randomizowany greedy**, nie pełny NN — losowość z `Math.random()` daje różne starty przy każdej iteracji `multiStartSolver`, co jest sensem multi-start.

## 4. Lokalne przeszukiwanie — `localSearch`

Pętla `while (improved && iteration < maxIterations)` wykonuje po kolei:

1. **`relocateOperator`** — first-improvement: sprawdza przeniesienie każdego punktu do każdej innej pozycji (w tej samej lub innej trasie); przy pierwszym ruchu obniżającym `totalCost` przerywa i wraca do `localSearch`.
2. **`swapOperator`** — analogicznie, ale wymienia dwa punkty miejscami (w tej samej lub między trasami).
3. **`twoOpt`** — inaczej niż powyższe: dla każdej trasy z osobna przechodzi **wszystkie** pary `(i, k)` i zapamiętuje **najlepszy** znaleziony ruch (best-improvement), nie przerywa na pierwszym trafieniu.

Ta niekonsekwencja (first-improvement w relocate/swap vs. best-improvement w twoOpt) nie jest błędem, ale warto o niej wiedzieć przy dalszym tuningu wydajności/jakości.

## 5. Funkcja kosztu

`routeCostEvaluator` → `createSimulationState` → `simulateRoute` (symulacja czasu przejazdu, obsługi, oczekiwania, przerw i odpoczynków) → sumuje kary z modułu `penalties/`:

| Kara | Warunek | Waga |
|---|---|---|
| `workTimePenalty` | przekroczony `maxWorkDurationMinutes` | `HARD_PENALTY_PER_MINUTE` |
| `shiftEndPenalty` | przyjazd po `workEndMinutes` | `HARD_PENALTY_PER_MINUTE` |
| `timeWindowPenalty` | spóźnienie względem okna czasowego punktu | `WINDOW_PENALTY_PER_MINUTE` |
| `priorityPenalty` | punkt o priorytecie > 5 odwiedzony późno w trasie | `PRIORITY_BASE` |
| `returnToDepotPenalty` | pojazd nie wrócił do depot, gdy `returnToDepot=true` | `RETURN_VIOLATION` (stała) |
| `drivingRulesPenalty` | suma czasu przerw + odpoczynków | `DRIVING_RULE_BREAK_WEIGHT` |

`totalCost = travelTime + suma wszystkich kar powyżej`. `solutionCostEvaluator` sumuje to po wszystkich trasach.

`feasible = true` tylko gdy `workTime`, `shiftEnd`, `timeWindows` i `returnViolation` są zerowe/puste — **patrz sekcja 7, pkt 1: to nie jest w pełni prawdziwe.**

## 6. Symulacja reguł jazdy UE 561/2006 (Faza 1)

`consumeDriving` rozdziela odcinek jazdy na kawałki (`chunk`) ograniczone trzema czynnikami, sprawdzanymi w tej kolejności:

1. **Ciągła jazda** — jeśli `continuousDrivingMinutes` sięga `maxContinuousDrivingMinutes`, wstawiana jest przerwa `drivingBreakMinutes` (reset licznika ciągłej jazdy).
2. **Dzienny limit jazdy** — `getDailyDrivingCapacity`: normalnie `maxDailyDrivingMinutes`; jeśli wykorzystany i nie użyto jeszcze wyjątku w tym cyklu i `exceptionsUsed < maxExceptionsPerWeek` → wolno przedłużyć do `maxDailyDrivingExceptionMinutes`.
3. Gdy dzienny limit (łącznie z wyjątkiem) się wyczerpie → `insertDailyRest`: odpoczynek skrócony (`reducedDailyRestMinutes`, limitowany `maxReducedRestCount` razy) albo pełny (`regularDailyRestMinutes`).

Kolejność sprawdzania (ciągła jazda → limit dzienny → odpoczynek) jest istotna — sprawdzenie dziennego limitu **musi** nastąpić po decyzji o przerwie ciągłej, inaczej wyjątek dzienny może zostać pominięty (patrz zapisane wcześniej ustalenia projektowe).

Dla `driverMode: COURIER` używana jest uproszczona ścieżka `consumeDrivingWithBreakRulesFallback` (`breakRules.afterMinutes` / `breakDurationMinutes`), bez reguł UE. Dla `NONE` — brak ograniczeń czasu jazdy.

## 7. Znane problemy w kodzie (do poprawy, nie tylko do udokumentowania)

1. **`routeCostEvaluator` — martwy warunek feasibility.** W kodzie:
   ```ts
   const feasible =
     state.violations.workTime === 0 &&
     state.violations.shiftEnd === 0 &&
     state.violations.timeWindows.length === 0 &&
     !state.violations.returnViolation;
   state.violations.drivingRulesViolations.length === 0;  // <- osobny statement, wynik odrzucony
   ```
   Brakujący `&&` na końcu przedostatniej linii powoduje, że druga linia jest samodzielnym (bezużytecznym) wyrażeniem — `drivingRulesViolations` **nigdy** nie wpływa na `feasible`. To realny bug, nie tylko kwestia stylu — trasa może być oznaczona jako `feasible: true` mimo naruszeń reguł jazdy.

2. **Nieużywany, nietypowy import.** `engine/simulateRoute.ts` importuje `wait` z `next/dist/lib/wait` — wewnętrzny moduł frameworku, nieużywany w kodzie. Do usunięcia; import z prywatnego API Next.js może się wysypać po aktualizacji frameworka.

3. **Martwy kod.** `nearestNeighborMulti` (wersja bez randomizacji) nie jest wywoływana przez `multiStartSolver` — zastąpiła ją `nearestNeighborMultiRandom`. Do usunięcia albo do zostawienia z komentarzem "legacy/reference", jeśli ma wartość edukacyjną w portfolio.

## 8. Parametry

| Parametr | Domyślna wartość | Gdzie |
|---|---|---|
| `iterations` (multi-start) | 20 | `multiStartSolver` |
| `maxIterations` (local search) | 50 | wywołanie w `multiStartSolver` |
| `randomness` (candidate list) | 3 | wywołanie w `multiStartSolver` |

## 9. Faza 2 (planowana)

- limity tygodniowe / dwutygodniowe jazdy,
- rekompensata skróconego odpoczynku,
- podzielona przerwa (15 + 30 min).
