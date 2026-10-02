"use client";

import { formatMinutes } from "@/utils/formatMinutes";
import { useSolution } from "../../api/useSolution";

type Props = {
  routeId: string;
};

const VEHICLE_COLORS = ["#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6"];



export function SolutionPanel({ routeId }: Props) {
  const { data: solution, isLoading } = useSolution(routeId);

  if (isLoading)
    return (
      <div className="text-sm text-muted-foreground">
        Ładowanie rozwiązania...
      </div>
    );
  if (!solution)
    return (
      <div className="text-sm text-muted-foreground"> Brak rozwiązania</div>
    );

  return (
    <div className="flex flex-col gap-6">
      {solution.vehicleRoutes.map((vr: any) => {
        const color = VEHICLE_COLORS[vr.vehicleIndex % VEHICLE_COLORS.length];
        return (
          <div className="space-y-2" key={vr.id}>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="font-medium text-sm">
                Pojazd {vr.vehicleIndex + 1}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                {vr.stops.length} punktów
              </span>
            </div>
            <ol className="space-y-1 pl-5">
              {vr.stops.map((stop: any, index: number) => (
                <li
                  key={stop.id}
                  className=" text-sm text-muted-foreground flex gap-2"
                >
                  <span className="text-xs font-medium w-4">{index + 1}.</span>
                  <span>
                    {stop.point.name ??
                      `${stop.point.latitude}, ${stop.point.longitude}`}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        );
      })}
      <div className="border-t pt-4 grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Dystans
          </p>
          <p className="font-semibold">
            {solution.totalDistanceKm?.toFixed(1) ?? "—"} km
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Czas
          </p>
          <p className="font-semibold">{formatMinutes(solution.totalCost)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Pojazdy
          </p>
          <p className="font-semibold">{solution.vehicleRoutes.length}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Cena
          </p>
          <p className="font-semibold">
            {solution.estimatedPrice != null
              ? `${solution.estimatedPrice.toFixed(2)} zł`
              : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
