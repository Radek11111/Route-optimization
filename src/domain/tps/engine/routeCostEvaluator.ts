import { Constraints } from "@/domain/types/Constraints";
import { CostResult } from "@/domain/types/costResult";
import { Point } from "@/domain/types/Point";
import { buildPointIndexMap } from "./pointItex.map";
import { createSimulationState } from "./simulationState.factory";
import { simulateRoute } from "./routeSimulator";
import { calculateWorkTimePenalty } from "./penalties/workTime.penalty";
import { calculateTimeWindowPenalty } from "./penalties/time-window.penalty";
import { calculatePriorityPenalty } from "./penalties/priority.penalty";
import { calculateReturnPenalty } from "./penalties/returnPenalties";
import { CostBreakdown } from "@/domain/types/CostBreakdown";

export function evaluateRouteCost(
  route: string[],
  matrix: number[][],
  points: Point[],
  constraints: Constraints,
  depotIndex: number = 0,
): CostResult {
  const pointIndexMap = buildPointIndexMap(points);
  const state = createSimulationState(depotIndex);
  simulateRoute(
    route,
    matrix,
    points,
    pointIndexMap,
    constraints,
    depotIndex,
    state,
  );

  const workTimePenalty = calculateWorkTimePenalty(state, constraints);
  const timeWindowPenalty = calculateTimeWindowPenalty(state);
  const priorityPenalty = calculatePriorityPenalty(
    route,
    points,
    pointIndexMap,
  );
  const returnToDepotPenalty = calculateReturnPenalty(
    state,
    constraints,
    depotIndex,
  );

  const breakdown: CostBreakdown = {
    travelTime: state.totalTravelTime,
    serviceTime: state.totalServiceTime,
    workTimePenalty,
    timeWindowPenalty,
    priorityPenalty,
    returnToDepotPenalty,
  };

  const totalCost =
    breakdown.travelTime +
    breakdown.serviceTime +
    breakdown.workTimePenalty +
    breakdown.timeWindowPenalty +
    breakdown.priorityPenalty +
    breakdown.returnToDepotPenalty;

  const feasible =
    state.violations.workTime === 0 &&
    state.violations.timeWindows.length === 0 &&
    state.violations.returnViolation === false;
  return {
    totalCost,
    breakdown,
    feasible,
  };
}
