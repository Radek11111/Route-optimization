export interface Constraints {
  workStartMinutes: number;
  workEndMinutes: number;

  maxWorkDurationMinutes: number;

  breakRules?: {
    afterMinutes: number;
    breakDurationMinutes: number;
  };

  returnToDepot?: boolean;

  drivingRules?: DrivingRules;
}

export interface DrivingRules {
  maxContinuousDrivingMinutes: number;
  drivingBreakMinutes: number;
  splitBreak?: { first: number; second: number };
  maxDailyDrivingMinutes: number;
  maxDailyDrivingExceptionMinutes: number;
  maxExceptionsPerWeek: number;
  regularDailyRestMinutes: number;
  reducedDailyRestMinutes: number;
  maxReducedRestCount: number;
}
