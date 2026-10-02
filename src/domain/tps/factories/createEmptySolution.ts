import { Solution } from "@/domain/types/Solution";

export function createEmptySolution(vehicleCount: number): Solution {
  return {
    routes: Array.from({ length: vehicleCount }, () => []),
    unassigned: [],
    totalCost: 0,
    feasible: true,
  };
}
