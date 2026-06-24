import { getRouteGeometry } from "@/lib/osrm/getRouteGeometry";
import L from "leaflet";
import { Stop, VehicleRoute } from "../types";

const VEHICLE_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6"];

export async function addVehicleRoute(
  map: L.Map,
  vehicleRoute: VehicleRoute,
  returnToDepot: boolean,
  depot: Stop,
  color: string = VEHICLE_COLORS[
    vehicleRoute.vehicleIndex % VEHICLE_COLORS.length
  ],
) {
  const coordinates: [number, number][] = [
    [depot.longitude, depot.latitude],

    ...vehicleRoute.stops.map(
      (s) => [s.longitude, s.latitude] as [number, number],
    ),

    ...(returnToDepot
      ? ([[depot.longitude, depot.latitude]] as [number, number][])
      : []),
  ];

  try {
    const geometry = await getRouteGeometry(coordinates);

    const latlngs: L.LatLngExpression[] = geometry.map(([lon, lat]) => [
      lat,

      lon,
    ]);

    L.polyline(latlngs, { color, weight: 3, opacity: 0.7 }).addTo(map);
  } catch (error) {
    const latlngs: L.LatLngExpression[] = [
      [depot.latitude, depot.longitude],

      ...vehicleRoute.stops.map(
        (s) => [s.latitude, s.longitude] as L.LatLngExpression,
      ),

      [depot.latitude, depot.longitude],
    ];

    L.polyline(latlngs, {
      color,

      weight: 3,

      opacity: 0.5,

      dashArray: "6",
    }).addTo(map);
  }
}
