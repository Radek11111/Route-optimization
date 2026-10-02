export const DEFAULT_EU_DRIVING_RULES = {
  maxContinuousDrivingMinutes: 270, // 4.5h
  drivingBreakMinutes: 45, // 45 min
  maxDailyDrivingMinutes: 540, // 9h
  maxDailyDrivingExceptionMinutes: 600, // 10h
  maxExceptionsPerWeek: 2,
  regularDailyRestMinutes: 660, // 11h
  reducedDailyRestMinutes: 540, // 9h
  maxReducedRestCount: 3,
} as const;
