import { Constraints } from "@/domain/types/Constraints";
import { RouteSimulationState } from "@/domain/types/RouteSimulationState";

export function createSimulationState(
  depotIndex: number,
  constraints: Constraints,
): RouteSimulationState {
  return {
    currentTime: constraints.workStartMinutes,
    totalTravelTime: 0,
    totalServiceTime: 0,
    totalBreakTime: 0,
    totalRestTime: 0,
    lastPointIndex: depotIndex,

    continuousDrivingMinutes: 0,
    drivingSinceRestMinutes: 0,
    exceptionsUsed: 0,
    reducedRestUsed: 0,
    totalDrivingRuleBreaks: 0,
    exceptionUsedThisCycle: false,

    workSinceBreakMinutes: 0,
    

    violations: {
      workTime: 0,
      shiftEnd: 0,
      timeWindows: [],
      returnViolation: false,

      drivingRulesViolations: [],
    },
  };
}
