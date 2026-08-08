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
  if (!vehicleRoute.stops || vehicleRoute.stops.length === 0) {
    return;
  }

  const coordinates: [number, number][] = [
    [depot.longitude, depot.latitude],

    ...vehicleRoute.stops.map(
      (s) => [s.longitude, s.latitude] as [number, number],
    ),

    ...(returnToDepot
      ? ([[depot.longitude, depot.latitude]] as [number, number][])
      : []),
  ];

  const fallbackLatLngs: L.LatLngExpression[] = [
    [depot.latitude, depot.longitude],
    ...vehicleRoute.stops
      .filter((s) => s.latitude !== undefined && s.longitude !== undefined)
      .map((s) => [s.latitude, s.longitude] as L.LatLngExpression),
    ...(returnToDepot
      ? [[depot.latitude, depot.longitude] as L.LatLngExpression]
      : []),
  ];

  try {
    
    const geometry = await getRouteGeometry(coordinates);
    

    const latlngs: L.LatLngExpression[] = geometry
      .filter(([lon, lat]) => lon !== undefined && lat !== undefined)
      .map(([lon, lat]) => [lat, lon]);



    if (latlngs.length > 0) {
   
      L.polyline(latlngs, { color, weight: 3, opacity: 0.7 }).addTo(map);
    }
   
  } catch (error) {
    console.warn(
      `Błąd OSRM dla pojazdu ${vehicleRoute.vehicleIndex}, rysuję linię prostą.`,
      error,
    );

    if (!map.getContainer()) return;

    if (fallbackLatLngs.length >= 2) {
      L.polyline(fallbackLatLngs, {
        color,
        weight: 3,
        opacity: 0.5,
        dashArray: "6",
      }).addTo(map);
    }
  }
}
