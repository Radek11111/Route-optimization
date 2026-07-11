export type CreateRouteInput = {
  name: string;
  description?: string;
  vehicleCount: number;
  workStartMinutes: number;
  workEndMinutes: number;
  maxWorkDurationMinutes: number;
  breakAfterMinutes?: number;
  breakDurationMinutes?: number;
  returnToDepot: boolean;
  ratePerKm?: number;
  estimatedPrice?: number;
};
