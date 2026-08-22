import { CostBreakdown } from "@/domain/types/CostBreakdown";

export function createEmptyBreakdown(): CostBreakdown {
  return {
    travelTime: 0,
    serviceTime: 0,
    waitingTime: 0,
    breakTime: 0,
    restTime: 0,

    workTimePenalty: 0,
    shiftEndPenalty: 0,
    timeWindowPenalty: 0,
    priorityPenalty: 0,
    returnToDepotPenalty: 0,
    drivingRulesPenalty: 0,
  };
}
