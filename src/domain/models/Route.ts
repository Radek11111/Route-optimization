export interface Route {
    orderPointIds: string[];
    totalDurationMinutes: number;
    totalDistanceKm: number;
    totalServiceTimeMinutes: number;

    violations: {
        exceededWorkTime: boolean;
        timeWindowViolations: boolean;
    }
}