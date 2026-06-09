"use client";
import dynamic from "next/dynamic";

export const RouteMap = dynamic(() => import("@/components/map/RouteMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      Ładowanie mapy...
    </div>
  ),
});
