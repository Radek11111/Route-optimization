export interface CostBreakdown {
    travelTime: number;
    serviceTime: number;
    workTimePenalty: number;
    timeWindowPenalty: number;
    returnToDepotPenalty: number;
    priorityPenalty: number;
}

export interface CostResult {
    totalCost: number;
    breakdown: CostBreakdown;
    feasible: boolean;
}