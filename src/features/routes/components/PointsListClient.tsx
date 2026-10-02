"use client"

import { usePoints } from "../api/usePoints";

type Props = {
  routeId: string;
};

export function PointsListClient({ routeId }: Props) {
  const { data: points, isLoading, isError } = usePoints(routeId);

  if (isLoading) return <div>Ładowanie punktów...</div>;
  if (isError)
    return <div className="text-red-500">Błąd pobierania punktów.</div>;
  if (!points?.length)
    return (
      <div className="text-muted-foreground">
        Brak punktów. Dodaj pierwszy punkt.
      </div>
    );

  return (
        <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Nazwa</th>
            <th className="px-4 py-3 text-left font-medium">Lat</th>
            <th className="px-4 py-3 text-left font-medium">Lng</th>
            <th className="px-4 py-3 text-left font-medium">Czas (min)</th>
            <th className="px-4 py-3 text-left font-medium">Priorytet</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.id} className="border-b hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3">{point.name ?? "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">{point.latitude}</td>
              <td className="px-4 py-3 text-muted-foreground">{point.longitude}</td>
              <td className="px-4 py-3 text-muted-foreground">{point.serviceTimeMinutes}</td>
              <td className="px-4 py-3 text-muted-foreground">{point.priority}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  
}
