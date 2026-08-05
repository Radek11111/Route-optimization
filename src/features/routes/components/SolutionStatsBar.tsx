"use client";

import { useSolution } from "../api/useSolution";

type Props = {
  routeId: string;
};

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

export function SolutionStatsBar({ routeId }: Props) {
  const { data: solution } = useSolution(routeId);
  console.log("SolutionStatsBar solution", solution);
  

  if (!solution) return null;

  const assignedPoints = solution.vehicleRoutes.reduce(
    (acc: number, vr: any) => acc + vr.stops.length,
    0,
  );

  const activeVehicles = solution.vehicleRoutes.filter(
    (vr: any) => vr.stops.length > 0,
  ).length;
  const totalVehicles = solution.vehicleRoutes.length;
  const avgPointsPerVehicle =
    activeVehicles > 0 ? (assignedPoints / activeVehicles).toFixed(1) : "—";

  const stats = [
    {
      label: "Dystans",
      value:
        solution.totalDistanceKm != null
          ? `${solution.totalDistanceKm.toFixed(1)} km`
          : "—",
    },
    {
      label: "Czas",
      value: formatMinutes(solution.totalCost),
    },
    {
      label: "Koszt",
      value:
        solution.estimatedPrice != null
          ? `${solution.estimatedPrice.toFixed(2)} zł`
          : "—",
    },
    {
      label: "Pojazdy",
      value: `${activeVehicles}/${totalVehicles}`,
    },
    {
      label: "Śr. punktów",
      value: avgPointsPerVehicle,
    },
    {
      label: "Nieprzypisane",
      value: solution.unassignedPoints?.length ?? 0,
      highlight:
        (solution.unassignedPoints?.length ?? 0) > 0 ? "orange" : undefined,
    },
    {
      label: "Oszczędność",
      value:
        solution.savedDistanceKm != null
          ? `${solution.savedDistanceKm.toFixed(1)} km`
          : "—",
      highlight: "green",
    },
    {
      label: "vs trasa naiwna",
      value: solution.savedPercent != null ? `${solution.savedPercent}%` : "—",
      highlight: "green",
    },
    {
      label: "Status",
      value: solution.feasible ? "Feasible" : "Infeasible",
      highlight: solution.feasible ? "green" : "red",
    },
  ];
  return (
    <div className="border-t flex bg-background px-6 py-3 items-center gap-8">
      {stats.map((stat) => (
        <div className="flex flex-col " key={stat.label}>
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            {stat.label}
          </span>
          <span className="font-semibold text-sm">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}
