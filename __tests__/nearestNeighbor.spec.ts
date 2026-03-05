
import { nearestNeighbor } from "@/domain/tps/heuristics/nearestNeighbor";
import { describe, expect, it } from "vitest";

describe("nearest neighbor", () => {
  it("should visit all points exactly once", () => {
    const matrix = [
      [0, 1, 5],
      [1, 0, 2],
      [5, 2, 0],
    ];
    const route = nearestNeighbor(3, matrix, 0);

    expect(route.length).toBe(3);
    const uniquePoints = new Set(route);
    expect(uniquePoints.size).toBe(3);
  });

  it("should choose nearest neighbor first", () => {
    const matrix = [
      [0, 1, 10],
      [1, 0, 2],
      [10, 2, 0],
    ];
    const route = nearestNeighbor(3, matrix, 0);
    expect(route[1]).toBe(1);
  });

  it(" should start from provided startIndex", () => {
    const matrix = [
      [0, 1, 10],
      [1, 0, 2],
      [10, 2, 0],
    ];
    const route = nearestNeighbor(3, matrix, 2);
    expect(route[0]).toBe(2);
  });
});
