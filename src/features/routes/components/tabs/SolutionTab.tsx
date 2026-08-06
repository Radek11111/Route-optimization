"use client";

import { useSolution } from "../../api/useSolution";

type Props = {
  routeId: string;
};

const VEHICLE_COLORS = ["#3498db", "#2ecc71", "#f39c12", "#e74c3c", "#9b59b6"];

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function SolutionTab({ routeId }: Props) {
  const { data: solution, isLoading } = useSolution(routeId);

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

  return (
    <div className="p-3 space-y-3">
      {solution.vehicleRoutes.map((vr: any) => {
        const color = VEHICLE_COLORS[vr.vehicleIndex % VEHICLE_COLORS.length];

        return (
          <div key={vr.id} className="rounded-md border p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm font-medium">
                Pojazd {vr.vehicleIndex + 1}
              </span>
              <span
                className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${vr.feasible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {vr.feasible ? "feasible" : "infeasible"}
              </span>
            </div>

            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>⊙ {vr.stops.length} stopów</span>
            </div>

            <ol className="space-y-1 pl-1">
              {vr.stops.slice(0, 4).map((stop: any) => (
                <li
                  key={stop.id}
                  className="text-xs text-muted-foreground flex gap-2"
                >
                  <span>→</span>
                  <span className="truncate">
                    {" "}
                    {stop.point.name ??
                      `${stop.point.latitude}, ${stop.point.longitude}`}
                  </span>
                </li>
              ))}
              {vr.stops.length > 4 && (
                <li className="text-xs text-muted-foreground pl-4">
                  ...{vr.stops.length - 4} kolejnych
                </li>
              )}
            </ol>
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
