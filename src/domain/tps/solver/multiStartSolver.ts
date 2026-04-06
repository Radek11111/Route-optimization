import { Constraints } from "@/domain/types/Constraints";
import { Point } from "@/domain/types/Point";
import { Solution } from "@/domain/types/Solution";
import { nearestNeighborMultiRandom } from "../heuristics/nearestNeighborMultiRandom";
import { localSearch } from "./localSearch";

type Input = {
  matrix: number[][];
  points: Point[];
  constraints: Constraints;
  depotIndex: number;
  vehicleCount: number;
  iterations?: number;
};

export function multiStartSolver(
  input: Input,
  initialSolution: Solution,
): Solution {
  const iterations = input.iterations ?? 20;

  let bestSolution = structuredClone(initialSolution);
  let bestCost = Infinity;

  for (let i = 0; i < iterations; i++) {
    const initialSolution = nearestNeighborMultiRandom({
      pointCount: input.points.length,
      vehicleCount: input.vehicleCount,
      durationMatrix: input.matrix,
      depotIndex: input.depotIndex,
      randomness: 3,
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
    throw new Error("No solution found");
  }

  return bestSolution;
}
