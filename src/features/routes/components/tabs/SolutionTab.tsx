"use client";

import { useState } from "react";
import { useSolution } from "../../api/useSolution";
import { ChevronDown, ChevronUp, Clock, MapPin, Road } from "lucide-react";
import { formatMinutes } from "@/utils/formatMinutes";

type Props = {
  routeId: string;
};

const VEHICLE_COLORS = ["#3498db", "#2ecc71", "#f39c12", "#e74c3c", "#9b59b6"];

export function SolutionTab({ routeId }: Props) {
  const { data: solution, isLoading } = useSolution(routeId);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (isLoading)
    return (
      <div className="p-4 text-sm text-muted-foreground">Ładowanie...</div>
    );
  if (!solution)
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Brak rozwiązania — kliknij Generate route.
      </div>
    );

  function toggleExpand(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="p-3 space-y-2">
      {solution.vehicleRoutes.map((vr: any) => {
        const color = VEHICLE_COLORS[vr.vehicleIndex % VEHICLE_COLORS.length];
        const isExpanded = expanded[vr.id] ?? false;

        return (
          <div key={vr.id} className="rounded-md border overflow-hidden">
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-semibold">
                  Pojazd {vr.vehicleIndex + 1}
                </span>
                <span
                  className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    vr.feasible
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {vr.feasible ? "Wykonalne" : "Niewykonalne"}
                </span>
              </div>

              <div className="flex gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {vr.stops.length} punktów
                </span>
                {vr.totalTravelTime && (
                  <>
                    <span className="flex items-center gap-1">
                      <Road className="h-3 w-3" />
                      {vr.totalDistanceKm.toFixed(1)} km
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatMinutes(vr.totalTravelTime)}
                    </span>
                  </>
                )}
              {(vr.totalWaitingTime > 0 ||
                vr.totalBreakTime > 0 ||
                vr.totalRestTime > 0) && (
                <div className="flex gap-3 text-[11px] text-muted-foreground">
                  {vr.totalWaitingTime > 0 && (
                    <span>
                      Oczekiwanie: {formatMinutes(vr.totalWaitingTime)}
                    </span>
                  )}
                  {vr.totalBreakTime > 0 && (
                    <span>Przerwy: {formatMinutes(vr.totalBreakTime)}</span>
                  )}
                  {vr.totalRestTime > 0 && (
                    <span>Odpoczynek: {formatMinutes(vr.totalRestTime)}</span>
                  )}
                </div>
              )}
              </div>

              {vr.stops.length > 0 && (
                <p className="text-xs text-muted-foreground truncate">
                  {vr.stops
                    .slice(0, 3)
                    .map((s: any) => s.point.name ?? "—")
                    .join(" → ")}
                  {vr.stops.length > 3 && " → ..."}
                </p>
              )}
            </div>

            {vr.stops.length > 0 && (
              <>
                <button
                  onClick={() => toggleExpand(vr.id)}
                  className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-muted-foreground hover:bg-muted border-t transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3" /> Zwiń
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" /> Rozwiń przystanki
                    </>
                  )}
                </button>

                {isExpanded && (
                  <ol className="border-t divide-y">
                    {vr.stops.map((stop: any, index: number) => (
                      <li
                        key={stop.id}
                        className="flex items-center gap-2 px-3 py-2 text-xs"
                      >
                        <span
                          className="w-5 h-5 rounded-full text-white flex items-center justify-center shrink-0 text-[10px] font-bold"
                          style={{ backgroundColor: color }}
                        >
                          {index + 1}
                        </span>
                        <span className="truncate">
                          {stop.point.name ??
                            `${stop.point.latitude}, ${stop.point.longitude}`}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </>
            )}
          </div>
        );
      })}

      {solution.unassignedPoints?.length > 0 && (
        <div className="rounded-md border border-orange-200 bg-orange-50 p-3">
          <p className="text-xs font-medium text-orange-700">
            ⚠ {solution.unassignedPoints.length} punkt
            {solution.unassignedPoints.length > 1 ? "y" : ""} nieprzypisany
          </p>
          {solution.unassignedPoints.map((up: any) => (
            <p key={up.id} className="text-xs text-orange-600 mt-1">
              — {up.point?.name ?? "Nieznany punkt"}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
