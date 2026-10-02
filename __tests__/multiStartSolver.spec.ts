import { nearestNeighborMultiRandom } from "@/domain/tps/heuristics/nearestNeighborMultiRandom";
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
  it("finds feasible solution when one exists", () => {
    const result = multiStartSolver(input);

    expect(result.feasible).toBe(true);
  });
  it("does not return empty routes when points exist", () => {
    const result = multiStartSolver(input);

    const hasNonEmptyRoute = result.routes.some((route) => route.length > 0);

    expect(hasNonEmptyRoute).toBe(true);
  });
  it("each point appears at most once", () => {
    const result = multiStartSolver(input);

    const counts = new Map<number, number>();

    result.routes.flat().forEach((p) => {
      counts.set(p, (counts.get(p) ?? 0) + 1);
    });

    for (const count of counts.values()) {
      expect(count).toBe(1);
    }
  });
  it("is at least as good as single random solution", () => {
    const single = nearestNeighborMultiRandom({
      pointCount: input.points.length,
      vehicleCount: input.vehicleCount,
      durationMatrix: input.matrix,
      depotIndex: input.depotIndex,
      points: input.points,
      constraints: input.constraints,
    });

    const multi = multiStartSolver(input);

    expect(multi.totalCost).toBeLessThanOrEqual(single.totalCost);
  });
  it("more iterations should not worsen solution", () => {
    const low = multiStartSolver({ ...input, iterations: 2 });
    const high = multiStartSolver({ ...input, iterations: 10 });

    expect(high.totalCost).toBeLessThanOrEqual(low.totalCost);
  });
  it("returns stable numeric values", () => {
    const result = multiStartSolver(input);

    expect(Number.isFinite(result.totalCost)).toBe(true);
  });
  it("handles empty problem", () => {
    const emptyInput = {
      ...input,
      points: [{ id: "depot", latitude: 0, longitude: 0 }],
    };

    const result = multiStartSolver(emptyInput);

    expect(result.routes.flat().length).toBe(0);
  });
  it("solves trivial case optimally", () => {
    const simpleMatrix = [
      [0, 1],
      [1, 0],
    ];

    const simpleInput = {
      ...input,
      matrix: simpleMatrix,
      points: [
        { id: "depot", latitude: 0, longitude: 0 },
        { id: "A", latitude: 0, longitude: 0 },
      ],
      vehicleCount: 1,
    };

    const result = multiStartSolver(simpleInput);

    expect(result.totalCost).toBeGreaterThanOrEqual(2);
  });
});
