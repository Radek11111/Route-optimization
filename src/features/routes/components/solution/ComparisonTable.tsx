import { tr } from "zod/v4/locales/index.js";

type Props = { solution: any };

export function ComparisonTable({ solution }: Props) {
  const assignedPoints = solution.vehicleRoutes.reduce(
    (acc: number, vr: any) => acc + vr.stops.length,
    0,
  );

  const activeVehicles = solution.vehicleRoutes.filter(
    (vr: any) => vr.stops.length > 0,
  ).length;

  const avgPoints =
    activeVehicles > 0 ? (assignedPoints / activeVehicles).toFixed(1) : "-";

  const naiveVehicles = solution.vehicleRoutes.length;
  const naiveCost =
    solution.estimatedPrice && solution.savedPercent
      ? (solution.estimatedPrice / (1 - solution.savedPercent / 100)).toFixed(2)
      : null;

  const rows = [
    {
      label: "Dystans",
      naive: solution.naiveDistanceKm
        ? `${solution.naiveDistanceKm.toFixed(1)} km`
        : "—",
      optimized: solution.totalDistanceKm
        ? `${solution.totalDistanceKm.toFixed(1)} km`
        : "—",
      diff: solution.savedDistanceKm
        ? `${solution.savedDistanceKm.toFixed(1)} km (${solution.savedPercent}%)`
        : "—",
      positive: true,
    },
    {
      label: "Koszt",
      naive: naiveCost ? `${naiveCost} zł` : "—",
      optimized: solution.estimatedPrice
        ? `${solution.estimatedPrice.toFixed(2)} zł`
        : "—",
      diff: solution.savedPercent ? `${solution.savedPercent}%` : "—",
      positive: true,
    },
    {
      label: "Pojazdy",
      naive: naiveVehicles,
      optimized: activeVehicles,
      diff: `${activeVehicles - naiveVehicles}`,
      positive: activeVehicles < naiveVehicles,
    },

  ];

  return (
    <div className="">
      <h3 className="text-sm font-semibold mb-3">1. Porównanie przed / po</h3>
      <table className="w-full table-fixed text-xs">
        <thead>
          <tr className="border-b">
            <th className="text-left py-1.5 text-muted-foreground font-medium">
              KPI
            </th>
            <th className="text-left py-1.5 text-muted-foreground font-medium">
              Naiwna
            </th>
            <th className="text-left py-1.5 text-muted-foreground font-medium">
              Zoptymalizowana
            </th>
            <th className="text-center py-1.5 text-muted-foreground font-medium">
              Różnica
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="py-1.5 text-muted-foreground ">{row.label}</td>
              <td className="py-1.5 text-left">{row.naive}</td>
              <td className="py-1.5 text-left font-medium">{row.optimized}</td>
              <td
                className={`py-1.5 text-center font-medium ${row.positive ? "text-green-600" : ""}`}
              >
                {row.diff}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {solution.savedDistanceKm && (
        <p className="mt-2 text-xs text-blue-600 bg-blue-50 rounded px-2 py-1.5">
          {" "}
          ℹ Solver skrócił dystans o {solution.savedDistanceKm.toFixed(1)} km (
          {solution.savedPercent}%)
        </p>
      )}
    </div>
  );
}
