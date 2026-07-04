"use client";

import { useSolution } from "../api/useSolution";

type Props = {
  routeId: string;
};

const VEHICLE_COLORS = ["#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6"];

export function SolutionPanel({ routeId }: Props) {
  const { data: solution, isLoading } = useSolution(routeId);
  console.log(solution);

  if (isLoading) return <div className="">Ładowanie rozwiązania...</div>;
  if (!solution)
    return <div className="text-muted-foreground"> Brak rozwiązania</div>;

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Koszt całkowity:{" "}
        <span className="font-medium text-foreground">
          {Math.round(solution.totalCost)} min
        </span>
      </div>
      {solution.vehicleRoutes.map((vr: any) => {
        const color = VEHICLE_COLORS[vr.vehicleIndex % VEHICLE_COLORS.length];
        return (
          <div key={vr.id} className="rounded-md border p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              >
                <span className="font-medium text-sm">
                  {" "}
                  Pojazd {vr.vehicleIndex + 1}
                </span>
                <span className=" text-xs text-muted-foreground ml-auto">
                  {vr.stops.length} punktów
                </span>
              </div>
              <ol className="space-y-1">
                {vr.stops.map((stop: any) => (
                  <li
                    key={stop.id}
                    className=" text-sm text-muted-foreground flex gap-2"
                  >
                    <span> {stop.order + 1}</span>
                    <span>
                      {" "}
                      {stop.point.name ??
                        `${stop.point.latitude}, ${stop.point.longitude}`}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        );
      })}
    </div>
  );
}
