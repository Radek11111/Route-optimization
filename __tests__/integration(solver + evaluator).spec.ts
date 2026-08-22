import { describe, it, expect } from "vitest";
import { multiStartSolver } from "@/domain/tps/solver/multiStartSolver";
import { solutionCostEvaluator } from "@/domain/tps/evaluators/solutionCostEvaluator";
import { Constraints } from "@/domain/types/Constraints";

describe("integration: solver + evaluator", () => {
  const matrix = [
    [0, 10, 20, 30],
    [10, 0, 15, 25],
    [20, 15, 0, 10],
    [30, 25, 10, 0],
  ];

  const constraints: Constraints = {
    workStartMinutes: 0,
    workEndMinutes: 500,
    maxWorkDurationMinutes: 500,
    returnToDepot: true,
    drivingRules: {
      maxContinuousDrivingMinutes: 100,
      drivingBreakMinutes: 15,
      maxDailyDrivingMinutes: 500,
      maxDailyDrivingExceptionMinutes: 600,
      maxExceptionsPerWeek: 1,
      regularDailyRestMinutes: 600,
      reducedDailyRestMinutes: 540,
      maxReducedRestCount: 1,
    },
  };

  const input = {
    matrix,
    points: [
      { id: "depot", latitude: 0, longitude: 0 },
      { id: "A", latitude: 0, longitude: 0 },
      { id: "B", latitude: 0, longitude: 0 },
      { id: "C", latitude: 0, longitude: 0 },
    ],
    constraints,
    depotIndex: 0,
    vehicleCount: 2,
    iterations: 20,
  };

  it("produces a feasible solution with a consistent cost breakdown", () => {
    const result = multiStartSolver(input);

    expect(result.totalCost).toBeGreaterThan(0);
    expect(result.feasible).toBe(true);

    const evaluation = solutionCostEvaluator(
      result.routes,
      matrix,
      input.points,
      constraints,
      0,
    );

    const { breakdown } = evaluation;

   
    const expectedTotal =
      breakdown.travelTime +
      breakdown.workTimePenalty +
      breakdown.shiftEndPenalty +
      breakdown.timeWindowPenalty +
      breakdown.priorityPenalty +
      breakdown.returnToDepotPenalty +
      breakdown.drivingRulesPenalty;

    expect(evaluation.totalCost).toBeCloseTo(expectedTotal);

   
    expect(breakdown.serviceTime).toBeGreaterThanOrEqual(0);
    expect(breakdown.waitingTime).toBeGreaterThanOrEqual(0);
    expect(breakdown.breakTime).toBeGreaterThanOrEqual(0);
    expect(breakdown.restTime).toBeGreaterThanOrEqual(0);
  });
});
