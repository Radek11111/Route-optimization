export interface RouteSimulationState {
  currentTime: number;
  totalTravelTime: number;
  totalServiceTime: number;
  lastPointIndex: number;

  continuousDrivingMinutes: number;
  drivingSinceRestMinutes: number;
  exceptionsUsed: number;
  reducedRestUsed: number;
  totalDrivingRuleBreaks: number;

  violations: {
    workTime: number;
    timeWindows: { pointId: string; violation: number }[];
    returnViolation: boolean;

    drivingRulesViolations: string[];
  };
}
