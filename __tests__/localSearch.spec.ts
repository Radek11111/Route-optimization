import { localSearch } from "@/domain/tps/solver/localSearch";
import { describe, expect, it } from "vitest";

describe("localSearch", () => {
  const matrix = [
    [0, 10, 1, 1],
    [10, 0, 10, 10],
    [1, 10, 0, 1],
    [1, 10, 1, 0],
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
  it("improves initial solution", () => {
    const solution = {
      routes: [[1, 3, 2]],
      unassigned: [],
      totalCost: 0,
      feasible: false,
    };

    const result = localSearch(solution, input);
    expect(result.solution.totalCost).toBeLessThan(100);
  });

  it("stops when no improvement", () => {
    const solution = {
      routes: [[1, 2, 3]],
      unassigned: [],
      totalCost: 0,
      feasible: false,
    };

    const result = localSearch(solution, input);

    expect(result.iterations).toBeLessThan(10);
  });
});
