import { RouteSimulationState } from "@/domain/types/RouteSimulationState";

export function createSimulationState(depotIndex: number): RouteSimulationState {
  return {
    currentTime: 0,
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
