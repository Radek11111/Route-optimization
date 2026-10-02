"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { addDepotMarker } from "./helpers/addDepotMarker";
import { addVehicleMarkers } from "./helpers/addVehicleMarkers";
import { Stop, VehicleRoute } from "./types";
import { addVehicleRoute } from "./helpers/addVehicleRoute";

type Props = {
  depot: Stop;
  vehicleRoutes: VehicleRoute[];
  returnToDepot: boolean;
};

export default function RouteMap({
  depot,
  vehicleRoutes,
  returnToDepot,
}: Props) {
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

    addDepotMarker(depot, map);
    addVehicleMarkers(map, vehicleRoutes);

    const drawRoutes = async () => {
      for (const vr of vehicleRoutes) {
        await addVehicleRoute(map, vr, returnToDepot, depot);
      }
    };

    drawRoutes().catch(console.error);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [depot, vehicleRoutes, returnToDepot]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}
