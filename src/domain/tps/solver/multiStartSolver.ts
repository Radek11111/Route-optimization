import { Constraints } from "@/domain/types/Constraints";
import { Point } from "@/domain/types/Point";
import { Solution } from "@/domain/types/Solution";
import { nearestNeighborMultiRandom } from "../heuristics/nearestNeighborMultiRandom";
import { localSearch } from "./localSearch";
import { createEmptySolution } from "../factories/createEmptySolution";

type Input = {
  matrix: number[][];
  points: Point[];
  constraints: Constraints;
  depotIndex: number;
  vehicleCount: number;
  iterations?: number;
};

export function multiStartSolver(input: Input): Solution {
  if (input.points.length <= 1) {
    return createEmptySolution(input.vehicleCount);
  }

  const iterations = input.iterations ?? 20;

  let bestSolution: Solution | null = null;
  let bestCost = Infinity;

  for (let i = 0; i < iterations; i++) {
    const initialSolution = nearestNeighborMultiRandom({
      pointCount: input.points.length,
      vehicleCount: input.vehicleCount,
      durationMatrix: input.matrix,
      depotIndex: input.depotIndex,
      randomness: 3,
      points: input.points,
      constraints: input.constraints,
    });
    const improvedSolution = localSearch(initialSolution, {
      matrix: input.matrix,
      points: input.points,
      constraints: input.constraints,
      depotIndex: input.depotIndex,
      maxIterations: 50,
    });

    const cost = improvedSolution.solution.totalCost;
    if (cost < bestCost) {
      bestCost = cost;
      bestSolution = improvedSolution.solution;
    }
  }
  if (!bestSolution) {
    return createEmptySolution(input.vehicleCount);
  }

  return bestSolution;
}
