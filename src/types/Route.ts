export type Route = {
  id: string;
  name: string | null;
  description: string | null;
  status: "DRAFT" | "READY" | "ARCHIVED";
  vehicleCount: number;
  createdAt: string;
  depotPointId: string | null;
  _count: {
    points: number;
  };
};
