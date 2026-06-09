export type Stop = {
  id: string;
  name?: string | null;
  latitude: number;
  longitude: number;
};

export type VehicleRoute = {
  vehicleIndex: number;
  stops: Stop[];
};
