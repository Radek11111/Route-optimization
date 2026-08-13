import { describe, it, expect } from "vitest";
import { multiStartSolver } from "@/domain/tps/solver/multiStartSolver";

describe("integration: solver + evaluator", () => {
  const matrix = [
    [0, 10, 20, 30],
    [10, 0, 15, 25],
    [20, 15, 0, 10],
    [30, 25, 10, 0],
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
    vehicleCount: 2,
    iterations: 20,
  };

  it("produces feasible or near-feasible solution", () => {
    const result = multiStartSolver(input);

    expect(result.totalCost).toBeGreaterThan(0);
  });
});
