import { Solution } from "@/domain/types/Solution";

type Input = {
  pointCount: number;
  vehicleCount: number;
  durationMatrix: number[][];
  depotIndex: number;
};

export function nearestNeighborMulti(input: Input): Solution {
  validateMatrix(input.durationMatrix, input.pointCount);
  const { pointCount, vehicleCount, durationMatrix, depotIndex } = input;

  const unvisited = new Set<number>();

  for (let i = 0; i < pointCount; i++) {
    if (i !== depotIndex) {
      unvisited.add(i);
    }
  }
  const routes: number[][] = [];

  for (let v = 0; v < vehicleCount; v++) {
    const route: number[] = [];
    let currentIndex = depotIndex;

    while (unvisited.size > 0) {
      let nearestIndex: number | null = null;
      let nearestDistance = Infinity;

      for (const candidateIndex of unvisited) {
        const distance = durationMatrix[currentIndex][candidateIndex];
        if (distance === undefined) {
          throw new Error(
            `Duration from ${currentIndex} to ${candidateIndex} is undefined.`,
          );
        }
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = candidateIndex;
        }
      }
      if (nearestIndex === null) break;

      route.push(nearestIndex);
      unvisited.delete(nearestIndex);
      currentIndex = nearestIndex;

      if (route.length >= Math.ceil(pointCount / vehicleCount)) {
        break;
      }
    }
    routes.push(route);
  }

  function validateMatrix(matrix: number[][], size: number) {
    for (let i = 0; i < size; i++) {
      if (!matrix[i] || matrix[i].length !== size) {
        throw new Error(`Duration matrix must be ${size}x${size}.`);
      }

      for (let j = 0; j < size; j++) {
        if (matrix[i][j] == null) {
          throw new Error(`Matrix value missing at [${i}][${j}]`);
        }
      }
    }
  }
  return {
    routes,
    unassigned: Array.from(unvisited),
    totalCost: 0,
    feasible: false,
  };
}
