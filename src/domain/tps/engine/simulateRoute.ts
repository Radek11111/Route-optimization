import { Constraints, DrivingRules } from "@/domain/types/Constraints";
import { Point } from "@/domain/types/Point";
import { RouteSimulationState } from "@/domain/types/RouteSimulationState";
import { finalizeSimulation } from "./finalizeSimulation";
import { wait } from "next/dist/lib/wait";

type advanceKind = "driving" | "shortBreak" | "dailyRest";

export function simulateRoute(
  route: number[],
  distanceMatrix: number[][],
  points: Point[],
  constraints: Constraints,
  depotIndex: number,
  state: RouteSimulationState,
) {
  for (const pointIndex of route) {
    const point = points[pointIndex];
    const legDuration = distanceMatrix[state.lastPointIndex]?.[pointIndex];

    if (legDuration === undefined) {
      throw new Error(
        `Matrix missing value ${state.lastPointIndex} -> ${pointIndex}`,
      );
    }

    consumeDriving(state, legDuration, constraints);

    handleTimeWindow(state, point);
    applyServiceTime(state, point, constraints);
    state.lastPointIndex = pointIndex;
  }

  handleReturnToDepot(state, distanceMatrix, depotIndex, constraints, route);
  finalizeSimulation(state, constraints, depotIndex);
  return state;
}
function advanceTime(
  state: RouteSimulationState,
  minutes: number,
  kind: advanceKind,
) {
  state.currentTime += minutes;

  if (kind === "driving") {
    state.totalTravelTime += minutes;
    state.continuousDrivingMinutes += minutes;
    state.drivingSinceRestMinutes += minutes;
    return;
  }

  if (kind === "shortBreak") {
    state.totalBreakTime += minutes;
    state.continuousDrivingMinutes = 0;
    return;
  }

  state.totalRestTime += minutes;
  state.continuousDrivingMinutes = 0;
  state.drivingSinceRestMinutes = 0;
  state.exceptionUsedThisCycle = false;
}

function consumeDriving(
  state: RouteSimulationState,
  totalMinutes: number,
  constraints: Constraints,
) {
  const { drivingRules, breakRules } = constraints;
  if (!drivingRules) {
    consumeDrivingWithBreakRulesFallback(state, totalMinutes, breakRules);
    return;
  }

  let remaining = totalMinutes;

  while (remaining > 0) {
    const continuousCapacity =
      drivingRules.maxContinuousDrivingMinutes - state.continuousDrivingMinutes;

    if (continuousCapacity <= 0) {
      advanceTime(state, drivingRules.drivingBreakMinutes, "shortBreak");
      continue;
    }

    const dailyCapacity = getDailyDrivingCapacity(state, drivingRules);

    if (dailyCapacity <= 0) {
      insertDailyRest(state, drivingRules);
      continue;
    }

    const chunk = Math.min(remaining, continuousCapacity, dailyCapacity);
    advanceTime(state, chunk, "driving");
    remaining -= chunk;
  }
}

function consumeDrivingWithBreakRulesFallback(
  state: RouteSimulationState,
  totalMinutes: number,
  breakRules: Constraints["breakRules"],
) {
  if (!breakRules) {
    advanceTime(state, totalMinutes, "driving");
    return;
  }

  let remaining = totalMinutes;

  while (remaining > 0) {
    const capacity = breakRules.afterMinutes - state.workSinceBreakMinutes;

    if (capacity <= 0) {
      advanceTime(state, breakRules.breakDurationMinutes, "shortBreak");
      state.workSinceBreakMinutes = 0;
      continue;
    }
    const chunk = Math.min(remaining, capacity);
    advanceTime(state, chunk, "driving");
    state.workSinceBreakMinutes += chunk;
    remaining -= chunk;
  }
}

function getDailyDrivingCapacity(
  state: RouteSimulationState,
  rules: DrivingRules,
): number {
  const regularCapacity =
    rules.maxDailyDrivingMinutes - state.drivingSinceRestMinutes;

  if (regularCapacity > 0) return regularCapacity;

  if (
    !state.exceptionUsedThisCycle &&
    state.exceptionsUsed < rules.maxExceptionsPerWeek
  ) {
    const exceptionCapacity =
      rules.maxDailyDrivingExceptionMinutes - state.drivingSinceRestMinutes;

    if (exceptionCapacity > 0) {
      state.exceptionUsedThisCycle = true;
      state.exceptionsUsed++;
      return exceptionCapacity;
    }
  }

  return 0;
}

function insertDailyRest(state: RouteSimulationState, rules: DrivingRules) {
  const reducedAvailable = state.reducedRestUsed < rules.maxReducedRestCount;
  const restMinutes = reducedAvailable
    ? rules.reducedDailyRestMinutes
    : rules.regularDailyRestMinutes;

  if (reducedAvailable) state.reducedRestUsed++;

  advanceTime(state, restMinutes, "dailyRest");
}

function handleTimeWindow(state: RouteSimulationState, point: Point) {
  if (!point.timeWindow) return;

  const { start, end } = point.timeWindow;
  const arrival = state.currentTime % 1440;
  const isOvernight = start > end;

  const withinWindow = isOvernight
    ? arrival >= start || arrival <= end
    : arrival >= start && arrival <= end;

  if (withinWindow) return;

  if (isOvernight) {
    const waiting = start - arrival;
    state.currentTime += waiting;
    state.totalWaitingTime += waiting;
    return;
  }

  if (arrival < start) {
    const waiting = start - arrival;
    state.currentTime += waiting;
    state.totalWaitingTime += waiting;
    return;
  }

  state.violations.timeWindows.push({
    pointId: point.id,
    violation: arrival - end,
  });
}

function applyServiceTime(
  state: RouteSimulationState,
  point: Point,
  constraints: Constraints,
) {
  if (!point.serviceTimeMinutes) return;

  state.totalServiceTime += point.serviceTimeMinutes;
  state.currentTime += point.serviceTimeMinutes;

  if (!constraints.drivingRules && constraints.breakRules) {
    state.workSinceBreakMinutes += point.serviceTimeMinutes;
  }
}

function handleReturnToDepot(
  state: RouteSimulationState,
  matrix: number[][],
  depotIndex: number,
  constraints: Constraints,
  route: number[],
) {
  if (!constraints.returnToDepot) return;

  if (route.length === 0) return;

  if (state.lastPointIndex === depotIndex) return;

  const returnTime = matrix[state.lastPointIndex][depotIndex];
  consumeDriving(state, returnTime, constraints);

  state.lastPointIndex = depotIndex;
}
