import { Constraints } from "@/domain/types/Constraints";
import { CostResult } from "@/domain/types/costResult";
import { Point } from "@/domain/types/Point";
import { createSimulationState } from "../factories/createSimulationState";
import { simulateRoute } from "../engine/simulateRoute";

import { CostBreakdown } from "@/domain/types/CostBreakdown";
import { calculateWorkTimePenalty } from "../penalties/workTime.penalty";
import { calculateTimeWindowPenalty } from "../penalties/timeWindow.penalty";
import { calculatePriorityPenalty } from "../penalties/priority.penalty";
import { calculateReturnPenalty } from "../penalties/returnToDepot.penalty";
import { calculateDrivingRulesPenalty } from "../penalties/drivingRules.penalty";


export function routeCostEvaluator(
  route: number[],
  matrix: number[][],
  points: Point[],
  constraints: Constraints,
  depotIndex: number = 0,
): CostResult {
  const state = createSimulationState(depotIndex, constraints);

  simulateRoute(route, matrix, points, constraints, depotIndex, state);

  const workTimePenalty = calculateWorkTimePenalty(state);
  const timeWindowPenalty = calculateTimeWindowPenalty(state);
  const priorityPenalty = calculatePriorityPenalty(route, points);
  const returnToDepotPenalty = calculateReturnPenalty(state);
  const drivingRulesPenalty = calculateDrivingRulesPenalty(state);

  const breakdown: CostBreakdown = {
    travelTime: state.totalTravelTime,
    workTimePenalty,
    timeWindowPenalty,
    priorityPenalty,
    returnToDepotPenalty,
    drivingRulesPenalty,
    drivingBreaks: state.totalDrivingRuleBreaks,
  };

  const totalCost =
    breakdown.travelTime +
    breakdown.workTimePenalty +
    breakdown.timeWindowPenalty +
    breakdown.priorityPenalty +
    breakdown.returnToDepotPenalty +
    breakdown.drivingRulesPenalty;

  const feasible =
    !state.violations.workTime &&
    state.violations.timeWindows.length === 0 &&
    !state.violations.returnViolation;
  return {
    totalCost,
    breakdown,
    feasible,
  };
}
