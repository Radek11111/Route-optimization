import { solutionCostEvaluator } from "@/domain/tps/evaluators/solutionCostEvaluator";
import { swapOperator } from "@/domain/tps/heuristics/swapOperator";
import { Constraints } from "@/domain/types/Constraints";
import { describe, expect, it } from "vitest";

describe("swapOperator", () => {
  const matrix = [
    [0, 100, 1, 1],
    [100, 0, 100, 1],
    [1, 100, 0, 100],
    [1, 1, 100, 0],
  ];
  const input = {
    matrix,
    points: [
      { id: "depot", latitude: 0, longitude: 0 },
      { id: "A", latitude: 0, longitude: 0 },
      { id: "B", latitude: 0, longitude: 0 },
      { id: "C", latitude: 0, longitude: 0 },
    ],
    constraints: {
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
    },
    depotIndex: 0,
    maxIterations: 10,
  };
  const solution = {
    routes: [[1, 2], [3]],
    totalCost: 0,
    feasible: true,
    unassigned: [],
  };
  it("improves solution when beneficial", () => {
    const solution = {
      routes: [[2, 1], [3]],
      totalCost: 0,
      feasible: true,
      unassigned: [],
    };
    const result = swapOperator(solution, input);

    expect(result.improved).toBe(true);
  });
  it("keeps all points", () => {
    const result = swapOperator(solution, input);
    const allPoints = result.solution.routes.flat();
    const uniquePoints = new Set(allPoints);

    expect(allPoints.length).toBe(uniquePoints.size);
  });

  it("does not lose or duplicate points", () => {
    const before = solution.routes.flat().sort();
    const result = swapOperator(solution, input);
    const after = result.solution.routes.flat().sort();
    expect(after).toEqual(before);
  });

  it("does not worsen solution", () => {
    const before = solutionCostEvaluator(
      solution.routes,
      input.matrix,
      input.points,
      input.constraints,
      input.depotIndex,
    ).totalCost;

    const result = swapOperator(solution, input);

    const after = solutionCostEvaluator(
      result.solution.routes,
      input.matrix,
      input.points,
      input.constraints,
      input.depotIndex,
    ).totalCost;

    expect(after).toBeLessThanOrEqual(before);
  });

  it("swapOperator's totalCost equals a fresh solutionCostEvaluator call", () => {
    const matrix = [
      [0, 10, 20, 15],
      [10, 0, 12, 18],
      [20, 12, 0, 9],
      [15, 18, 9, 0],
    ];

    const points = [
      { id: "depot", latitude: 0, longitude: 0 },
      { id: "A", latitude: 0, longitude: 0 },
      { id: "B", latitude: 0, longitude: 0 },
      { id: "C", latitude: 0, longitude: 0 },
    ];

    const constraints: Constraints = {
      workStartMinutes: 0,
      workEndMinutes: 500,
      maxWorkDurationMinutes: 500,
    };

    const input = { matrix, points, constraints, depotIndex: 0 };
    const initialSolution = {
      routes: [[1, 2], [3]],
      unassigned: [],
      totalCost: 0,
      feasible: true,
    };
    const result = swapOperator(initialSolution, input);

    const recomputed = solutionCostEvaluator(
      result.solution.routes,
      matrix,
      points,
      constraints,
      0,
    );

    expect(result.solution.totalCost).toBeCloseTo(recomputed.totalCost);
    expect(result.solution.feasible).toBe(recomputed.feasible);
  });
});
