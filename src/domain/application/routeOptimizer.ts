import { Constraints } from "../types/Constraints";
import { Point } from "../types/Point";
import { OptimizationResult } from "../types/OptimatizationResult";
import { nearestNeighbor } from "../tps/heuristics/nearestNeighbor";
import { mapIndicesToPoints } from "./mapIndicesToPoints";
import { simulateRoute } from "../tps/engine/simulateRoute";

export function optimizeRoute(
  points: Point[],
  durationMatrix: number[][],
  constraints: Constraints,
): OptimizationResult {
  const indices = nearestNeighbor(points.length, durationMatrix, 0);

  const orderedPoints = mapIndicesToPoints(indices, points);

  const simulation = simulateRoute(
    route,
    distanceMatrix,
    points,
    pointIndexMap,
    constraints,
    depotIndex,
    state,
  );
  return {};
}
