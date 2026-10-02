"use client";
import dynamic from "next/dynamic";
import { useRoute } from "../../api/useRoute";
import { usePoints } from "../../api/usePoints";
import { useSolution } from "../../api/useSolution";

export const RouteMap = dynamic(() => import("./RouteMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      Ładowanie mapy...
    </div>
  ),
});

type Props = {
  routeId: string;
  mode: "EDIT" | "SOLUTION";
};

export function RouteMapWrapper({ routeId, mode }: Props) {
  const { data: route } = useRoute(routeId);
  const { data: points } = usePoints(routeId);
  const { data: solution } = useSolution(routeId);

  if (!route?.depotPoint) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Ustaw depot żeby wyświetlić mapę
      </div>
    );
  }
  const depot = {
    id: route.depotPoint.id,
    name: route.depotPoint.name,
    latitude: route.depotPoint.latitude,
    longitude: route.depotPoint.longitude,
  };

  if (mode === "EDIT") {
    const editRoutes = points?.length
      ? [
          {
            vehicleIndex: 0,
            stops: points.map((point) => ({
              id: point.id,
              name: point.name,
              latitude: point.latitude,
              longitude: point.longitude,
            })),
          },
        ]
      : [];

    return (
      <RouteMap
        depot={depot}
        vehicleRoutes={editRoutes}
        returnToDepot={false}
      />
    );
  }

  if (!solution) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Brak rozwiązania
      </div>
    );
  }

  const vehicleRoutes = solution.vehicleRoutes.map((vr: any) => ({
    vehicleIndex: vr.vehicleIndex,
    stops: vr.stops.map((stop: any) => ({
      id: stop.point.id,
      name: stop.point.name,
      latitude: stop.point.latitude,
      longitude: stop.point.longitude,
    })),
  }));

  return (
    <RouteMap
      depot={depot}
      vehicleRoutes={vehicleRoutes}
      returnToDepot={route.returnToDepot}
    />
  );
}
