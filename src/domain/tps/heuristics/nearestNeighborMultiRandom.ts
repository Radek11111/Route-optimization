import { Constraints } from "@/domain/types/Constraints";
import { Point } from "@/domain/types/Point";
import { Solution } from "@/domain/types/Solution";
import { solutionCostEvaluator } from "../evaluators/solutionCostEvaluator";

type Input = {
  pointCount: number;
  vehicleCount: number;
  durationMatrix: number[][];
  depotIndex: number;
  randomness?: number;
  points: Point[];
  constraints: Constraints;
};

export function nearestNeighborMultiRandom(input: Input): Solution {
  const {
    pointCount,
    vehicleCount,
    durationMatrix,
    depotIndex,
    randomness = 2,
  } = input;

  validateMatrix(durationMatrix, pointCount);

  const unvisited = new Set<number>();

  for (let i = 0; i < pointCount; i++) {
    if (i !== depotIndex) {
      unvisited.add(i);
    }
  }

  const routes: number[][] = [];

  const maxPerVehicle = Math.ceil((pointCount - 1) / vehicleCount);

  for (let v = 0; v < vehicleCount; v++) {
    const route: number[] = [];
    let currentIndex = depotIndex;

    while (unvisited.size > 0 && route.length < maxPerVehicle) {
      const candidates = Array.from(unvisited)
        .map((idx) => {
          const distance = durationMatrix[currentIndex][idx];

          if (distance === undefined) {
            throw new Error(`Missing distance ${currentIndex} -> ${idx}`);
          }

          return { idx, distance };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, randomness);

      if (candidates.length === 0) break;

      const chosen = candidates[getRandomInt(candidates.length)];

      route.push(chosen.idx);
      unvisited.delete(chosen.idx);
      currentIndex = chosen.idx;
    }

    routes.push(route);
  }

  const evaluation = solutionCostEvaluator(
    routes,
    durationMatrix,
    input.points,
    input.constraints,
    depotIndex,
  );

  return {
    routes,
    unassigned: Array.from(unvisited),
    totalCost: evaluation.totalCost,
    feasible: evaluation.feasible,
  };
}

function validateMatrix(matrix: number[][], size: number) {
  for (let i = 0; i < size; i++) {
    if (!matrix[i] || matrix[i].length !== size) {
      throw new Error(`Matrix must be ${size}x${size}`);
    }
  }
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}
