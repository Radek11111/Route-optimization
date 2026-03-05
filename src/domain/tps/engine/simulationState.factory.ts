import { Constraints } from "@/domain/types/Constraints";
import { RouteSimulationState } from "@/domain/types/RouteSimulationState";

export function createSimulationState(depotIndex: number, constraints: Constraints): RouteSimulationState {
  return {
    currentTime: constraints.workStartMinutes,
    totalTravelTime: 0,
    totalServiceTime: 0,
    lastPointIndex: depotIndex,
    violations: {
      workTime: 0,
      timeWindows: [],
      returnViolation: false,
    },
  };
}
