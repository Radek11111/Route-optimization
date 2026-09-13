# Solver — optymalizacja-trasy

## 1. Purpose

The engine solves a VRPTW variant (Vehicle Routing Problem with Time Windows): it assigns points to vehicles and orders visits to minimize `totalCost`, subject to time windows, max work duration, priorities, an optional return-to-depot requirement, and — for `driverMode: TRUCK` — EU 561/2006 driving-time rules.

The solver never computes distance in km or price — it operates purely on `durationMatrix` (see `ARCHITECTURE.md`, "solver isolation").

## 2. Pipeline

```
multiStartSolver (default 20 iterations)
  └─ nearestNeighborMultiRandom   → initial solution (randomized greedy)
       └─ localSearch (max 50 iterations)
            ├─ relocateOperator   → move 1 point within/between routes
            ├─ swapOperator       → swap 2 points within/between routes
            └─ twoOpt             → reverse a route segment (per vehicle)
  → returns the lowest-totalCost solution found across all iterations
```

`multiStartSolver` mitigates local minima via repeated restarts from different initial solutions (randomization in `nearestNeighborMultiRandom`).

## 3. Construction heuristic — `nearestNeighborMultiRandom`

For each vehicle, from the unvisited points it takes the `randomness` (default 3) nearest to the current position and picks one at random. Per-vehicle cap: `maxPerVehicle = ceil((pointCount - 1) / vehicleCount)`. Points that don't fit into any vehicle end up in `unassigned`.

This is a **randomized greedy**, not a full NN pass — the `Math.random()` call gives a different starting solution on every `multiStartSolver` iteration, which is the whole point of multi-start.

## 4. Local search — `localSearch`

The `while (improved && iteration < maxIterations)` loop runs, in order:

1. **`relocateOperator`** — first-improvement: checks moving every point to every other position (same or different route); stops and returns to `localSearch` as soon as one improving move is found.
2. **`swapOperator`** — same idea, but swaps two points (within or across routes).
3. **`twoOpt`** — different strategy: for each route independently it scans **all** `(i, k)` pairs and keeps the **best** improving move found (best-improvement), rather than stopping at the first hit.

This inconsistency (first-improvement for relocate/swap vs. best-improvement for twoOpt) isn't a bug, but it's worth knowing about when tuning performance vs. solution quality later.

## 5. Cost function

`routeCostEvaluator` → `createSimulationState` → `simulateRoute` (simulates travel, service, waiting, breaks and rest) → sums penalties from `penalties/`:

| Penalty | Trigger | Weight |
|---|---|---|
| `workTimePenalty` | `maxWorkDurationMinutes` exceeded | `HARD_PENALTY_PER_MINUTE` |
| `shiftEndPenalty` | arrival after `workEndMinutes` | `HARD_PENALTY_PER_MINUTE` |
| `timeWindowPenalty` | late relative to a point's time window | `WINDOW_PENALTY_PER_MINUTE` |
| `priorityPenalty` | priority > 5 point visited late in the route | `PRIORITY_BASE` |
| `returnToDepotPenalty` | vehicle didn't return to depot when `returnToDepot=true` | `RETURN_VIOLATION` (constant) |
| `drivingRulesPenalty` | total break + rest time | `DRIVING_RULE_BREAK_WEIGHT` |

`totalCost = travelTime + sum of all penalties above`. `solutionCostEvaluator` sums this across all routes.

`feasible = true` only when `workTime`, `shiftEnd`, `timeWindows` and `returnViolation` are all zero/empty — **see section 7, item 1: this claim is not entirely true in the current code.**

## 6. EU 561/2006 driving-rules simulation (Phase 1)

`consumeDriving` splits a driving leg into chunks bounded by three checks, evaluated in this order:

1. **Continuous driving** — if `continuousDrivingMinutes` reaches `maxContinuousDrivingMinutes`, a `drivingBreakMinutes` break is inserted (continuous-driving counter resets).
2. **Daily driving limit** — `getDailyDrivingCapacity`: normally `maxDailyDrivingMinutes`; if exhausted and no exception used yet this cycle and `exceptionsUsed < maxExceptionsPerWeek`, driving may extend up to `maxDailyDrivingExceptionMinutes`.
3. Once the daily limit (including the exception) is exhausted → `insertDailyRest`: a reduced rest (`reducedDailyRestMinutes`, capped at `maxReducedRestCount` uses) or a full rest (`regularDailyRestMinutes`).

The check order (continuous driving → daily limit → rest) matters — the daily-limit check **must** happen after the continuous-break decision, otherwise the daily exception can be silently skipped (per earlier design notes on this project).

For `driverMode: COURIER`, a simplified path is used instead — `consumeDrivingWithBreakRulesFallback` (`breakRules.afterMinutes` / `breakDurationMinutes`), without EU rules. For `NONE`, there's no driving-time constraint at all.

## 7. Known issues in the code (need fixing, not just documenting)

1. **`routeCostEvaluator` — dead feasibility check.** In the code:
   ```ts
   const feasible =
     state.violations.workTime === 0 &&
     state.violations.shiftEnd === 0 &&
     state.violations.timeWindows.length === 0 &&
     !state.violations.returnViolation;
   state.violations.drivingRulesViolations.length === 0;  // <- separate statement, result discarded
   ```
   The missing `&&` at the end of the second-to-last line turns the last line into a standalone (useless) expression — `drivingRulesViolations` **never** affects `feasible`. This is a real bug, not just a style issue — a route can be marked `feasible: true` despite violating driving rules.

2. **Unused, non-standard import.** `engine/simulateRoute.ts` imports `wait` from `next/dist/lib/wait` — an internal framework module, unused in the code. Should be removed; importing from Next.js's private API can break on a framework upgrade.

3. **Dead code.** `nearestNeighborMulti` (the non-randomized version) is not called by `multiStartSolver` anymore — superseded by `nearestNeighborMultiRandom`. Remove it, or keep it explicitly labeled as "legacy/reference" if it has educational value for the portfolio.

## 8. Parameters

| Parameter | Default | Where |
|---|---|---|
| `iterations` (multi-start) | 20 | `multiStartSolver` |
| `maxIterations` (local search) | 50 | passed in `multiStartSolver` |
| `randomness` (candidate list) | 3 | passed in `multiStartSolver` |

## 9. Phase 2 (planned)

- weekly / bi-weekly driving limits,
- reduced-rest compensation,
- split break (15 + 30 min).
