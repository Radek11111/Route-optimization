export interface CostBreakdown {
  travelTime: number;
  serviceTime: number;
  waitingTime: number;
  breakTime: number;
  restTime: number;

  workTimePenalty: number;
  shiftEndPenalty: number;
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
