export interface Point {
    id: string;
    latitude: number;
    longitude: number;

    serviceTimeMinutes?: number;
    priority?: number;

    timeWindow?: {
        start: number;
        end: number;
    }
}