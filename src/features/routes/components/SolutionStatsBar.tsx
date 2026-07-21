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

  if (!solution) return null;

  const stats = [
    {
      label: "Dystans",
      value:
        solution.totalDistanceKm !== undefined
          ? `${solution.totalDistanceKm.toFixed(1)} km`
          : "-",
    },
    {
      label: "Czas",
      value: formatMinutes(solution.totalCost),
    },
    {
      label: "Pojazdy",
      value: solution.vehicleRoutes.length,
    },
    {
      label: "Punkty",
      value: solution.vehicleRoutes.reduce(
        (acc: number, vr: any) => acc + vr.stops.length,
        0,
      ),
    },
    {
      label: "Koszt",
      value:
        solution.estimatedPrice !== undefined
          ? `${solution.estimatedPrice.toFixed(2)} zł`
          : "-",
    },
  ];

  return (
    <div className="border-t flex bg-background px-6 py-3 items-center gap-8">
        {stats.map((stat) => (
            <div className="flex flex-col "key={stat.label}>
                <span className='text-xs text-muted-foreground uppercase tracking-wide'>
                    {stat.label}
                </span>
                <span className='font-semibold text-sm'>
                    {stat.value}
                </span>
            </div>
        ))}
    </div>
  )
}
