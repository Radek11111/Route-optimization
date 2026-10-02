import { nearestNeighborMultiRandom } from "@/domain/tps/heuristics/nearestNeighborMultiRandom";
import { describe, expect, it } from "vitest";

describe("nearestNeighborMultiRandom", () => {
  const points = [
    { id: "depot", latitude: 0, longitude: 0 },
    { id: "p1", latitude: 1, longitude: 1 },
    { id: "p2", latitude: 2, longitude: 2 },
    { id: "p3", latitude: 3, longitude: 3 },
  ];

  const matrix = [
    [0, 10, 20, 30],
    [10, 0, 15, 25],
    [20, 15, 0, 10],
    [30, 25, 10, 0],
  ];

  const constraints = {
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

  const baseInput = {
    pointCount: 4,
    vehicleCount: 2,
    durationMatrix: matrix,
    depotIndex: 0,
    points,
    constraints,
  };
  it("should returns correct nuber of routes", () => {
    const result = nearestNeighborMultiRandom(baseInput);
    expect(result.routes.length).toBe(baseInput.vehicleCount);
  });
  it("assigns each point to exactly once ", () => {
    const result = nearestNeighborMultiRandom(baseInput);
    const allPoits = result.routes.flat();
    const uniquePoints = new Set(allPoits);

    expect(uniquePoints.size).toBe(allPoits.length);
  });

  it("covers all non-depot points", () => {
    const result = nearestNeighborMultiRandom(baseInput);

    const allPoits = result.routes.flat().sort();

    expect(allPoits).toEqual([1, 2, 3]);
  });

  it("does not include depot in routes", () => {
    const result = nearestNeighborMultiRandom(baseInput);
    const allPoits = result.routes.flat();
    expect(allPoits.includes(0)).toBe(false);
  });

  it("respects vehicle capacity (balance split)", () => {
    const result = nearestNeighborMultiRandom(baseInput);

    const sizes = result.routes.map((route) => route.length);

    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
  });

  it("throws error for invalid matrix", () => {
    const invalidInput = [[0, 1]];

    expect(() =>
      nearestNeighborMultiRandom({
        ...baseInput,
        durationMatrix: invalidInput,
      }),
    ).toThrow();
  });
});
