export interface Point {
  id: string;
  latitude: number;
  longitude: number;
  name?: string;

  serviceTimeMinutes?: number;
  priority?: number;

  timeWindow?: {
    start: number;
    end: number;
  };
}
