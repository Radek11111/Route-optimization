import { Constraints, DrivingRules } from "@/domain/types/Constraints";
import { Point } from "@/domain/types/Point";
import { RouteSimulationState } from "@/domain/types/RouteSimulationState";
import { finalizeSimulation } from "./finalizeSimulation";

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
    travelToPoint(state, distanceMatrix, pointIndex);
    handleTimeWindow(state, point);
    applyServiceTime(state, point);
    state.lastPointIndex = pointIndex;
  }

  handleReturnToDepot(state, distanceMatrix, depotIndex, constraints, route);
  finalizeSimulation(state, constraints, depotIndex);
  return state;
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

  state.currentTime += rules.drivingBreakMinutes;
  state.totalDrivingRuleBreaks += rules.drivingBreakMinutes;
  state.continuousDrivingMinutes = 0;
}

function enforceDailyRest(
  state: RouteSimulationState,
  legDuration: number,
  rules: DrivingRules | undefined,
) {
  if (!rules) return;

  const exceptionAvailable = state.exceptionsUsed < rules.maxExceptionsPerWeek;
  const dailyLimit = exceptionAvailable
    ? rules.maxDailyDrivingExceptionMinutes
    : rules.maxDailyDrivingMinutes;

  const wouldExceed = state.drivingSinceRestMinutes + legDuration > dailyLimit;

  if (!wouldExceed) return;

  const reducedRestAvailable =
    state.reducedRestUsed < rules.maxReducedRestCount;

  const restMinutes = reducedRestAvailable
    ? rules.reducedDailyRestMinutes
    : rules.regularDailyRestMinutes;

  if (exceptionAvailable) state.exceptionsUsed++;
  if (reducedRestAvailable) state.reducedRestUsed++;

  state.currentTime += restMinutes;
  state.totalDrivingRuleBreaks += restMinutes;

  state.drivingSinceRestMinutes = 0;
  state.continuousDrivingMinutes = 0;
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
  state.totalTravelTime += travelTime;
  state.currentTime += travelTime;
}

function handleTimeWindow(state: RouteSimulationState, point: Point) {
  if (!point.timeWindow) return;

  const arrival = state.currentTime;

  if (arrival < point.timeWindow.start) {
    state.currentTime = point.timeWindow.start;
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
  state.totalTravelTime += returnTime;
  state.currentTime += returnTime;
  state.lastPointIndex = depotIndex;
}
