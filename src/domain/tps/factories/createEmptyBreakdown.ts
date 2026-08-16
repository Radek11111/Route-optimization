import { CostBreakdown } from "@/domain/types/CostBreakdown";

export function createEmptyBreakdown(): CostBreakdown {
  return {
    travelTime: 0,
    workTimePenalty: 0,
    timeWindowPenalty: 0,
    priorityPenalty: 0,
    returnToDepotPenalty: 0,
    drivingRulesPenalty: 0,
    drivingBreaks: 0,
  };
}
