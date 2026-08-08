import { relocateOperator } from "@/domain/tps/heuristics/relocateOperator";
import { describe, expect, it } from "vitest";

describe("relocateOperator", () => {
  it("improves solution by relocating point", () => {
    const solution = {
      routes: [[1, 2], [3]],
      unassigned: [],
      totalCost: 0,
      feasible: false,
    };

    const matrix = [
      [0, 1, 10, 10],
      [1, 0, 1, 10],
      [10, 1, 0, 1],
      [10, 10, 1, 0],
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
    };
    const result = relocateOperator(solution, input);
    expect(result.improved).toBe(true);
  });
  it("does not change already optimal solution", () => {
    const solution = {
      routes: [[1, 2, 3]],
      unassigned: [],
      totalCost: 0,
      feasible: false,
    };

    const matrix = [
      [0, 1, 2, 3],
      [1, 0, 1, 2],
      [2, 1, 0, 1],
      [3, 2, 1, 0],
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
    };

    const result = relocateOperator(solution, input);

    expect(result.improved).toBe(false);
  });
  it("keeps all points in solution", () => {
    const matrix = [
      [0, 1, 2, 3],
      [1, 0, 1, 2],
      [2, 1, 0, 1],
      [3, 2, 1, 0],
    ];
    const solution = {
      routes: [[1, 2], [3]],
      unassigned: [],
      totalCost: 0,
      feasible: false,
    };
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
    };

    const result = relocateOperator(solution, input);

    const allPoints = result.solution.routes.flat();

    expect(new Set(allPoints).size).toBe(3);
  });
});
