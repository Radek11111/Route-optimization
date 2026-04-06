import { solutionCostEvaluator } from "@/domain/tps/evaluators/solutionCostEvatuator";
import { nearestNeighborMultiRandom } from "@/domain/tps/heuristics/nearestNeighborMultiRandom";
import { multiStartSolver } from "@/domain/tps/solver/multiStartSolver";
import { describe, expect, it } from "vitest";

describe("nearestNeighborMultiRandom", () => {
  const matrix = [
    [0, 10, 20, 30],
    [10, 0, 15, 25],
    [20, 15, 0, 10],
    [30, 25, 10, 0],
  ];

  const points = [
    { id: "depot", latitude: 0, longitude: 0 },
    { id: "A", latitude: 0, longitude: 0 },
    { id: "B", latitude: 0, longitude: 0 },
    { id: "C", latitude: 0, longitude: 0 },
  ];

  const constraints = {
    workStartMinutes: 0,
    workEndMinutes: 1000,
    maxWorkDurationMinutes: 1000,
    returnToDepot: true,
  };

  const input = {
    matrix,
    points,
    constraints,
    depotIndex: 0,
    vehicleCount: 2,
  };
 it("assigns points uniquely", () => {
   const result = nearestNeighborMultiRandom({
     pointCount: 4,
     vehicleCount: 2,
     durationMatrix: matrix,
     depotIndex: 0,
   });

   const allPoints = result.routes.flat();
   const unique = new Set(allPoints);

   expect(unique.size).toBe(allPoints.length);
 });
 it("covers all non-depot points", () => {
   const result = nearestNeighborMultiRandom({
     pointCount: 4,
     vehicleCount: 2,
     durationMatrix: matrix,
     depotIndex: 0,
   });

   const allPoints = result.routes.flat().sort();

   expect(allPoints).toEqual([1, 2, 3]);
 });


});
