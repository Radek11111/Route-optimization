import { Point } from "./Point";

export interface OptimizationResult {
  orderPoints: Point[];
  cost: number;
  feasible: boolean;
}
