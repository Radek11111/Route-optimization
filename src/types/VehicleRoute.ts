export type VehicleRoute = {
  id: string;
  vehicleIndex: number;
  stops: any[];
  totalDistanceKm: number;
  totalTravelTime: number;
  totalWorkTime: number;
  estimatedPrice: number | null;
};
