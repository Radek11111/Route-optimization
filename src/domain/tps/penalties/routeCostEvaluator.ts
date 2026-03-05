import { Constraints } from "@/domain/types/Constraints";
import { CostResult } from "@/domain/types/costResult";
import { Point } from "@/domain/types/Point";
import { buildPointIndexMap } from "../engine/pointItex.map";
import { createSimulationState } from "../engine/simulationState.factory";
import { simulateRoute } from "../engine/simulateRoute";
import { calculateWorkTimePenalty } from "./workTime.penalty";
import { calculateTimeWindowPenalty } from "./timeWindow.penalty";
import { calculatePriorityPenalty } from "./priority.penalty";
import { calculateReturnPenalty } from "./returnPenalties";
import { CostBreakdown } from "@/domain/types/CostBreakdown";

export function routeCostEvaluator(
  route: number[],
  matrix: number[][],
  points: Point[],
  constraints: Constraints,
  depotIndex: number = 0,
): CostResult {
  const pointIndexMap = buildPointIndexMap(points);
  const state = createSimulationState(depotIndex, constraints);
  simulateRoute(route, matrix, points, constraints, depotIndex, state);

  const workTimePenalty = calculateWorkTimePenalty(state);
  const timeWindowPenalty = calculateTimeWindowPenalty(state);
  const priorityPenalty = calculatePriorityPenalty(route, points);
  const returnToDepotPenalty = calculateReturnPenalty(state);

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
