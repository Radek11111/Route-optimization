"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Stop = {
  id: string;
  name?: string | null;
  latitude: number;
  longitude: number;
};

type VehicleRoute = {
  vehicleIndex: number;
  stops: Stop[];
};

type Props = {
  depot: Stop;
  vehicleRoutes: VehicleRoute[];
};

const VEHICLE_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6"];

export default function RouteMap({ depot, vehicleRoutes }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView(
      [depot.latitude, depot.longitude],
      12,
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    
    const depotIcon = L.divIcon({
      className: "",
      html: `<div style="background:#1a1a2e;color:white;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:bold;">D</div>`,
    });
    L.marker([depot.latitude, depot.longitude], { icon: depotIcon })
      .addTo(map)
      .bindPopup(`<b>Depot</b><br>${depot.name ?? ""}`);

  
    vehicleRoutes.forEach((vr) => {
      const color = VEHICLE_COLORS[vr.vehicleIndex % VEHICLE_COLORS.length];

      vr.stops.forEach((stop, index) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="background:${color};color:white;padding:4px 8px;border-radius:50%;font-size:12px;font-weight:bold;width:28px;height:28px;display:flex;align-items:center;justify-content:center;">${index + 1}</div>`,
        });

        L.marker([stop.latitude, stop.longitude], { icon })
          .addTo(map)
          .bindPopup(
            `<b>${stop.name ?? "Point"}</b><br>Pojazd ${vr.vehicleIndex + 1}, stop ${index + 1}`,
          );
      });

      
      const latlngs: L.LatLngExpression[] = [
        [depot.latitude, depot.longitude],
        ...vr.stops.map((s) => [s.latitude, s.longitude] as L.LatLngExpression),
        [depot.latitude, depot.longitude],
      ];

      L.polyline(latlngs, { color, weight: 3, opacity: 0.7 }).addTo(map);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [depot, vehicleRoutes]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}
