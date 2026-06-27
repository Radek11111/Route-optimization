export type Point = {
  id: string;
  name: string | null;
  latitude: number;
  longitude: number;
  serviceTimeMinutes: number;
  priority: number;
  timeWindowStart: number | null;
  timeWindowEnd: number | null;
};
