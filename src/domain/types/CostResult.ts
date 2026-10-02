import { CostBreakdown } from "./CostBreakdown";

export interface CostResult {
    totalCost: number;
    breakdown: CostBreakdown;
    feasible: boolean;
}