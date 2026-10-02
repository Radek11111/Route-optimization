import { Solution } from "@/domain/types/Solution";

export function naiveSolution(
  pointCount: number,
  depotIndex: number,
): Solution {
  const points: number[] = [];

  for (let i = 0; i < pointCount; i++) {
    if (i !== depotIndex) points.push(i);
  }
  return {
    routes: [points],
    unassigned: [],
    totalCost: 0,
    feasible: true,
  };
}
