import { relocateRoute } from "@/domain/tps/heuristics/relocateRoute";
import { describe, expect, it } from "vitest";

describe("relocateRoute", () => {
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
        workEndMinutes: 1000,
        maxWorkDurationMinutes: 1000,
        returnToDepot: true,
      },
      depotIndex: 0,
    };
    const result = relocateRoute(solution, input);
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

    const result = relocateRoute(solution, input);

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

    const result = relocateRoute(solution, input);

    const allPoints = result.solution.routes.flat();

    expect(new Set(allPoints).size).toBe(3);
  });
});
