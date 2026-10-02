import L from "leaflet";
import { VehicleRoute } from "../types";

const VEHICLE_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6"];

export function addVehicleMarkers(
  map: L.Map,
  vehicleRoutes: VehicleRoute[],
  color: string[] = VEHICLE_COLORS,
) {
  vehicleRoutes.forEach((vr) => {
    vr.stops.forEach((stop, index) => {
      const icon = L.divIcon({
        className: "",
        html: `<div style="background:${color[vr.vehicleIndex % color.length]};color:white;width:28px;height:28px;border-radius:50%;font-size:12px;font-weight:bold;display:flex;align-items:center;justify-content:center;">${index + 1}</div>`,
      });

      L.marker([stop.latitude, stop.longitude], { icon })
        .addTo(map)
        .bindPopup(
          `<b>${stop.name ?? "Point"}</b><br>Pojazd ${vr.vehicleIndex + 1}, stop ${index + 1}`,
        );
    });
  });
}
