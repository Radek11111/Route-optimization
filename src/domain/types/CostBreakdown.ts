export interface CostBreakdown {
  travelTime: number;
  workTimePenalty: number;
  shiftEndPenalty: number;
  timeWindowPenalty: number;
  returnToDepotPenalty: number;
  priorityPenalty: number;
  drivingRulesPenalty: number;
  drivingBreaks: number;
}

export interface CostResult {
  totalCost: number;
  breakdown: CostBreakdown;
  feasible: boolean;
}
