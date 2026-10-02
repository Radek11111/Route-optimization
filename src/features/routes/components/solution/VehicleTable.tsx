import { formatMinutes } from "@/utils/formatMinutes";
import { Fragment } from "react";

type Props = { solution: any };

const VEHICLE_COLORS = ["#3498db", "#2ecc71", "#f39c12", "#e74c3c", "#9b59b6"];

export function VehicleTable({ solution }: Props) {
  if (!solution?.vehicleRoutes) {
    return null;
  }
  const totalPoints = solution.vehicleRoutes.reduce(
    (acc: number, vr: any) => acc + vr.stops.length,
    0,
  );

  function formatBreakdownLine(vr: any): string | null {
    const parts: string[] = [];

    if (vr.totalServiceTime > 0)
      parts.push(`Obsługa ${formatMinutes(vr.totalServiceTime)}`);
    if (vr.totalWaitingTime > 0)
      parts.push(`Oczekiwanie ${formatMinutes(vr.totalWaitingTime)}`);
    if (vr.totalBreakTime > 0)
      parts.push(`Przerwy ${formatMinutes(vr.totalBreakTime)}`);
    if (vr.totalRestTime > 0)
      parts.push(`Odpoczynek ${formatMinutes(vr.totalRestTime)}`);

    return parts.length > 0 ? parts.join(" · ") : null;
  }

  return (
    <div className="">
      <h3 className="text-sm font-semibold mb-3">2.Szczegóły pojazdów</h3>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b">
            <th className="text-left py-1.5 text-muted-foreground font-medium">
              Pojazd
            </th>
            <th className="text-right py-1.5 text-muted-foreground font-medium">
              Punkty
            </th>
            <th className="text-right py-1.5 text-muted-foreground font-medium">
              Dystans
            </th>
            <th className="text-right py-1.5 text-muted-foreground font-medium">
              Czas jazdy
            </th>
            <th className="text-right py-1.5 text-muted-foreground font-medium">
              Czas pracy
            </th>
            <th className="text-right py-1.5 text-muted-foreground font-medium">
              Koszt
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {solution.vehicleRoutes.map((vr: any) => {
            const color =
              VEHICLE_COLORS[vr.vehicleIndex % VEHICLE_COLORS.length];
            const distance = (vr.totalDistanceKm ?? 0).toFixed(1);
            const travelTime = formatMinutes(vr.totalTravelTime ?? 0);
            const workTime = formatMinutes(vr.totalWorkTime ?? 0);
            const price =
              vr.estimatedPrice !== null && vr.estimatedPrice !== undefined
                ? `${vr.estimatedPrice.toFixed(1)} zł`
                : "-";
            const breakdownLine = formatBreakdownLine(vr);

            return (
              <Fragment key={vr.id}>
                <tr key={vr.id}>
                  <td className="py-1.5 flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    Pojazd {vr.vehicleIndex + 1}
                  </td>
                  <td className="py-1.5 text-right">{vr.stops?.length ?? 0}</td>
                  <td className="py-1.5 text-right">{distance} km</td>
                  <td className="py-1.5 text-right">{travelTime}</td>
                  <td className="py-1.5 text-right">{workTime}</td>
                  <td className="py-1.5 text-right">{price}</td>
                </tr>
                {breakdownLine && (
                  <tr className="text-[11px] text-muted-foreground">
                    <td colSpan={6} className="pb-2 pl-4">
                      {" "}
                      {breakdownLine}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
          <tr className="border-t font-medium">
            <td className="py-1.5">Razem</td>
            <td className="py-1.5 text-right">{totalPoints}</td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
