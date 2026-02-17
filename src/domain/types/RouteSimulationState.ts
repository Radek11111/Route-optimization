export interface RouteSimulationState {
  currentTime: number;
  totalTravelTime: number;
  totalServiceTime: number;
  lastPointIndex: number;
  violations: {
    workTime: number;
    timeWindows: { pointId: string; violation: number }[];
    returnViolation: boolean;
  };
}
