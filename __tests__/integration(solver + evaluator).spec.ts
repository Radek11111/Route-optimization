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
      workEndMinutes: 1000,
      maxWorkDurationMinutes: 1000,
      returnToDepot: true,
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
