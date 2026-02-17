export interface Constraints {
  workStartMinutes: number;
  workEndMinutes: number;

  maxWorkDurationMinutes: number;

  breakRules?: {
    afterMinutes: number;
    breakDurationMinutes: number;
  };

  returnToDepot?: boolean;
}
