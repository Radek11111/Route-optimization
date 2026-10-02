import { Constraints } from "@/domain/types/Constraints";
import { Point } from "@/domain/types/Point";
import { createSimulationState } from "../factories/createSimulationState";
import { simulateRoute } from "../engine/simulateRoute";

import { CostBreakdown } from "@/domain/types/CostBreakdown";
import { calculateWorkTimePenalty } from "../penalties/workTime.penalty";
import { calculateTimeWindowPenalty } from "../penalties/timeWindow.penalty";
import { calculatePriorityPenalty } from "../penalties/priority.penalty";
import { calculateReturnPenalty } from "../penalties/returnToDepot.penalty";
import { calculateDrivingRulesPenalty } from "../penalties/drivingRules.penalty";
import { calculateShiftEndPenalty } from "../penalties/shiftEnd.penalty";
import { CostResult } from "@/domain/types/CostResult";

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
  const shiftEndPenalty = calculateShiftEndPenalty(state);
  const timeWindowPenalty = calculateTimeWindowPenalty(state);
  const priorityPenalty = calculatePriorityPenalty(route, points);
  const returnToDepotPenalty = calculateReturnPenalty(state);
  const drivingRulesPenalty = calculateDrivingRulesPenalty(state);

  const breakdown: CostBreakdown = {
    travelTime: state.totalTravelTime,
    serviceTime: state.totalServiceTime,
    waitingTime: state.totalWaitingTime,
    breakTime: state.totalBreakTime,
    restTime: state.totalRestTime,

    workTimePenalty,
    shiftEndPenalty,
    timeWindowPenalty,
    priorityPenalty,
    returnToDepotPenalty,
    drivingRulesPenalty,
  };

  const totalCost =
    breakdown.travelTime +
    breakdown.workTimePenalty +
    breakdown.shiftEndPenalty +
    breakdown.timeWindowPenalty +
    breakdown.priorityPenalty +
    breakdown.returnToDepotPenalty +
    breakdown.drivingRulesPenalty;

  const feasible =
    state.violations.workTime === 0 &&
    state.violations.shiftEnd === 0 &&
    state.violations.timeWindows.length === 0 &&
    !state.violations.returnViolation;
  state.violations.drivingRulesViolations.length === 0;
  return {
    totalCost,
    breakdown,
    feasible,
  };
}
