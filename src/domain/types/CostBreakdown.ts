export interface CostBreakdown {
  travelTime: number;
  workTimePenalty: number;
  timeWindowPenalty: number;
  returnToDepotPenalty: number;
  priorityPenalty: number;
  drivingRulesPenalty: number;
}

export interface CostResult {
  totalCost: number;
  breakdown: CostBreakdown;
  feasible: boolean;
}
