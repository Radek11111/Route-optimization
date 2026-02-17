import { Constraints } from "@/domain/types/Constraints";
import { Point } from "@/domain/types/Point";
import { RouteSimulationState } from "@/domain/types/RouteSimulationState";

export function simulateRoute(
  route: string[],
  distanceMatrix: number[][],
  points: Point[],
  pointIndex: Map<string, number>,
  constraints: Constraints,
  depotIndex: number,
  state: RouteSimulationState,
) {
  for (const pointId of route) {
    const pointIndexValue = pointIndex.get(pointId);
    if (pointIndexValue === undefined) continue;

    const point = points[pointIndexValue];

    travelToPoint(state, distanceMatrix, pointIndexValue);
    handleTimeWindow(state, point);
    applyServiceTime(state, point);

    state.lastPointIndex = pointIndexValue;
  }

  handleReturnToDepot(state, distanceMatrix, depotIndex, constraints, route);
}

function travelToPoint(
  state: RouteSimulationState,
  matrix: number[][],
  nextIndex: number,
) {
  const travelTime = matrix[state.lastPointIndex][nextIndex];
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
  route: string[],
) {
  if (!constraints.returnToDepot) return;

  if (route.length === 0) return;

  if (state.lastPointIndex === depotIndex) return;

  const returnTime = matrix[state.lastPointIndex][depotIndex];
  state.totalTravelTime += returnTime;
  state.currentTime += returnTime;
  state.lastPointIndex = depotIndex;
}
