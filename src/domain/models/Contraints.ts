export interface DriverConstraints {
    workStartMinutes: number;
    workEndMinutes: number;

    maxWorkDurationMinutes: number;

    breakRules?: {
        afterMinutes: number;
        breakDurationMinutes: number
    }

    returnToDepot?: boolean;
}