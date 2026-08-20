import { Constraints, DrivingRules } from "@/domain/types/Constraints";
import { Point } from "@/domain/types/Point";
import { RouteSimulationState } from "@/domain/types/RouteSimulationState";
import { finalizeSimulation } from "./finalizeSimulation";

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

    consumeDriving(state, legDuration, constraints.drivingRules);

    handleTimeWindow(state, point);
    applyServiceTime(state, point);
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
}

function consumeDriving(
  state: RouteSimulationState,
  totalMinutes: number,
  rules: DrivingRules | undefined,
) {
  if (!rules) {
    advanceTime(state, totalMinutes, "driving");
    return;
  }
  let remaining = totalMinutes;

  while (remaining > 0) {
    const continuousCapacity =
      rules.maxContinuousDrivingMinutes - state.continuousDrivingMinutes;
    const dailyCapacity = getDailyDrivingCapacity(state, rules);

    const chunk = Math.max(
      0,
      Math.min(remaining, continuousCapacity, dailyCapacity),
    );
    if (chunk > 0) {
      advanceTime(state, chunk, "driving");
      remaining -= chunk;
      if (remaining <= 0) break;
    }
    if (state.continuousDrivingMinutes >= rules.maxContinuousDrivingMinutes) {
      advanceTime(state, rules.drivingBreakMinutes, "shortBreak");
      continue;
    }
    insertDailyRest(state, rules);
  }
}

function getDailyDrivingCapacity(
  state: RouteSimulationState,
  rules: DrivingRules,
): number {
  const regularCapacity =
    rules.maxDailyDrivingMinutes - state.drivingSinceRestMinutes;

  if (regularCapacity > 0) return regularCapacity;

  if (state.exceptionsUsed < rules.maxExceptionsPerWeek) {
    const exceptionCapacity =
      rules.maxDailyDrivingExceptionMinutes - state.drivingSinceRestMinutes;

    if (exceptionCapacity > 0) {
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

  const arrival = state.currentTime % 1440;

  if (arrival < point.timeWindow.start) {
    state.currentTime += point.timeWindow.start - arrival;
    return;
  }
  if (arrival > point.timeWindow.end) {
    state.violations.timeWindows.push({
      pointId: point.id,
      violation: arrival - point.timeWindow.end,
    });
  }
}

function applyServiceTime(state: RouteSimulationState, point: Point) {
  if (!point.serviceTimeMinutes) return;

  state.totalServiceTime += point.serviceTimeMinutes;
  state.currentTime += point.serviceTimeMinutes;
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
  consumeDriving(state, returnTime, constraints.drivingRules);

  state.lastPointIndex = depotIndex;
}
