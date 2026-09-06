import { describe, it, expect } from "vitest";
import { nearestNeighborMulti } from "@/domain/tps/heuristics/nearestNeighborMulti";


describe("nearestNeighborMulti", () => {
  const matrix = [
    [0, 10, 20, 30],
    [10, 0, 15, 25],
    [20, 15, 0, 18],
    [30, 25, 18, 0],
  ];
  it("assigns all points exactly once", () => {
    const result = nearestNeighborMulti({
      pointCount: 4,
      vehicleCount: 2,
      durationMatrix: matrix,
      depotIndex: 0,
    });
    const allPoints = result.routes.flat();

    expect(allPoints.length).toBe(3);

    const uniquePoints = new Set(allPoints);
    expect(uniquePoints.size).toBe(3);
  });

  it("does not include depot in routes", () => {
    const result = nearestNeighborMulti({
      pointCount: 4,
      vehicleCount: 2,
      durationMatrix: matrix,
      depotIndex: 0,
    });
    const allPoints = result.routes.flat();
    expect(allPoints.includes(0)).toBe(false);
  });

  it("creates routes per vehicle", () => {
    const result = nearestNeighborMulti({
      pointCount: 4,
      vehicleCount: 3,
      durationMatrix: matrix,
      depotIndex: 0,
    });
    expect(result.routes.length).toBe(3);
  });

  it("distributes points across vehicles", () => {
    const result = nearestNeighborMulti({
      pointCount: 7,
      vehicleCount: 3,
      durationMatrix: [
        [0, 1, 2, 3, 4, 5, 6],
        [1, 0, 1, 2, 3, 4, 5],
        [2, 1, 0, 1, 2, 3, 4],
        [3, 2, 1, 0, 1, 2, 3],
        [4, 3, 2, 1, 0, 1, 2],
        [5, 4, 3, 2, 1, 0, 1],
        [6, 5, 4, 3, 2, 1, 0],
      ],
      depotIndex: 0,
    });
    const routeLengths = result.routes.map((route) => route.length);

    expect(Math.max(...routeLengths)).toBeLessThan(6);
  });

  it("returns unassigned points if vehicles are insufficient", () => {
    const result = nearestNeighborMulti({
      pointCount: 10,
      vehicleCount: 1,
      durationMatrix: Array.from({ length: 10 }, () =>
        Array.from({ length: 10 }, () => 1),
      ),
      depotIndex: 0,
    });
    const assignedPoints = result.routes.flat().length;
    const unassignedPoints = result.unassigned.length;

    expect(assignedPoints + unassignedPoints).toBe(9);
  });

  it("handles empty input", () => {
    const result = nearestNeighborMulti({
      pointCount: 0,
      vehicleCount: 2,
      durationMatrix: [],
      depotIndex: 0,
    });

    expect(result.routes.length).toBe(2);
    expect(result.unassigned.length).toBe(0);
  });

  it("handles single point", () => {
    const result = nearestNeighborMulti({
      pointCount: 1,
      vehicleCount: 2,
      durationMatrix: [[0]],
      depotIndex: 0,
    });

    const allPoints = result.routes.flat();

    expect(allPoints.length).toBe(0);
  });

  it("throws when matrix has undefined value", () => {
    const badMatrix = [
      [0, 10, 20],
      [10, 0, undefined as any],
      [20, 15, 0],
    ];

    expect(() =>
      nearestNeighborMulti({
        pointCount: 3,
        vehicleCount: 1,
        durationMatrix: badMatrix,
        depotIndex: 0,
      }),
    ).toThrow();
  });
});
