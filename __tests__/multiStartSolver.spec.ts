import { multiStartSolver } from "@/domain/tps/solver/multiStartSolver";

import { describe, expect, it } from "vitest";

describe("multiStartSolver", () => {
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
    iterations: 5,
  };

  it("returns a valid solution stucture", () => {
    const result = multiStartSolver(input);

    expect(result.routes.length).toBe(2);
    expect(Array.isArray(result.routes)).toBe(true);
  });

  it("does not duplicate points.", () => {
    const result = multiStartSolver(input);

    const allPoints = result.routes.flat();
    const uniquePoints = new Set(allPoints);

    expect(uniquePoints.size).toBe(allPoints.length);
  });

  it("covers all non-depot points OR marks them as unassigned.", () => {
    const result = multiStartSolver(input);
    const allPoints = result.routes.flat();
    const totalHandledPoints = allPoints.length + result.unassigned.length;

    expect(totalHandledPoints).toBe(3);
  });
  it("returns valid cost", () => {
    const result = multiStartSolver(input);

    expect(result.totalCost).toBeGreaterThanOrEqual(0);
  });

  it("returns feasibility flag", () => {
    const result = multiStartSolver(input);

    expect(typeof result.feasible).toBe("boolean");
  });
});
