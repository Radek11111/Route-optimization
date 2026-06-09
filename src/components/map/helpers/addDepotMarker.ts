import L from "leaflet";
import { Stop } from "../types";



export function addDepotMarker(depot: Stop, map: L.Map) {
  const depotIcon = L.divIcon({
    className: "",
    html: `<div style="background:#1a1a2e;color:white;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:bold;">D</div>`,
  });

  return L.marker([depot.latitude, depot.longitude], { icon: depotIcon })
    .addTo(map)
    .bindPopup(`<b>Depot</b><br>${depot.name ?? ""}`);
}
