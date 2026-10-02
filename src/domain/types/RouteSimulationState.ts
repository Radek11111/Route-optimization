export interface RouteSimulationState {
  currentTime: number;
  totalTravelTime: number;
  totalServiceTime: number;
  totalBreakTime: number;
  totalRestTime: number;
  totalWaitingTime: number;

  lastPointIndex: number;

  continuousDrivingMinutes: number;
  drivingSinceRestMinutes: number;
  exceptionsUsed: number;
  reducedRestUsed: number;
  totalDrivingRuleBreaks: number;
  exceptionUsedThisCycle: boolean;

  workSinceBreakMinutes: number;

  violations: {
    workTime: number;
    shiftEnd: number;
    timeWindows: { pointId: string; violation: number }[];
    returnViolation: boolean;
    drivingRulesViolations: string[];
  };
}
