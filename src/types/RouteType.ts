export type RouteType = {
  id: string;
  name: string | null;
  description: string | null;
  status: "DRAFT" | "READY" | "ARCHIVED";
  vehicleCount: number;
  createdAt: string;
  depotPointId: string | null;

  workStartMinutes: number;
  workEndMinutes: number;
  maxWorkDurationMinutes: number;
  returnToDepot: boolean;
  ratePerKm: number | null;

  driverMode: "TRUCK" | "COURIER" | "NONE";
  courierBreakAfterMinutes: number | null;
  courierBreakDurationMinutes: number | null;

  depotPoint?: { id: string; name: string | null } | null;

  _count: {
    points: number;
  };
};
