import { Constraints, DrivingRules } from "@/domain/types/Constraints";
import { Point } from "@/domain/types/Point";
import { RouteSimulationState } from "@/domain/types/RouteSimulationState";
import { finalizeSimulation } from "./finalizeSimulation";

type advanceTime = "driving" | "break";

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

    enforceDrivingBreak(state, legDuration, constraints.drivingRules);
    enforceDailyRest(state, legDuration, constraints.drivingRules);

    travelToPoint(state, distanceMatrix, pointIndex);
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
  kind: advanceTime,
) {
  state.currentTime += minutes;

  if (kind === "driving") {
    state.totalTravelTime += minutes;
    state.continuousDrivingMinutes += minutes;
    state.drivingSinceRestMinutes += minutes;
  } else {
    state.totalDrivingRuleBreaks += minutes;
    state.continuousDrivingMinutes = 0;
    state.drivingSinceRestMinutes = 0;
  }
}

function enforceDrivingBreak(
  state: RouteSimulationState,
  legDuration: number,
  rules: DrivingRules | undefined,
) {
  if (!rules) return;

  const wouldExceed =
    state.continuousDrivingMinutes + legDuration >
    rules.maxContinuousDrivingMinutes;

  if (!wouldExceed) return;

  advanceTime(state, rules.drivingBreakMinutes, "break");
}

function enforceDailyRest(
  state: RouteSimulationState,
  legDuration: number,
  rules: DrivingRules | undefined,
) {
  if (!rules) return;

  const overRegularLimit =
    state.drivingSinceRestMinutes + legDuration > rules.maxDailyDrivingMinutes;

  if (!overRegularLimit) return;

  const exceptionAvailable = state.exceptionsUsed < rules.maxExceptionsPerWeek;

  if (exceptionAvailable) {
    state.exceptionsUsed++;

    const stillExceedsWithException =
      state.drivingSinceRestMinutes + legDuration >
      rules.maxDailyDrivingExceptionMinutes;

    if (!stillExceedsWithException) return;
  }

  const reducedRestAvailable =
    state.reducedRestUsed < rules.maxReducedRestCount;
  const restMinutes = reducedRestAvailable
    ? rules.reducedDailyRestMinutes
    : rules.regularDailyRestMinutes;

  if (reducedRestAvailable) state.reducedRestUsed++;

  advanceTime(state, restMinutes, "break");
}

function travelToPoint(
  state: RouteSimulationState,
  matrix: number[][],
  nextIndex: number,
) {
  const travelTime = matrix[state.lastPointIndex]?.[nextIndex];
  if (travelTime === undefined) {
    throw new Error(
      `Matrix missing value ${state.lastPointIndex} -> ${nextIndex}`,
    );
  }
  advanceTime(state, travelTime, "driving");
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

  enforceDrivingBreak(state, returnTime, constraints.drivingRules);
  enforceDailyRest(state, returnTime, constraints.drivingRules);

  advanceTime(state, returnTime, "driving");

  state.lastPointIndex = depotIndex;
}
