import { formatMinutes } from "@/utitils/formatMinutes";

type Props = { solution: any };

const VEHICLE_COLORS = ["#3498db", "#2ecc71", "#f39c12", "#e74c3c", "#9b59b6"];

export function VehicleTable({ solution }: Props) {
  const totalPoints = solution.vehicleRoutes.reduce(
    (acc: number, vr: any) => acc + vr.stops.length,
    0,
  );
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
            return (
              <tr key={vr.id}>
                <td className="py-1.5 flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  Pojazd {vr.vehicleIndex + 1}
                </td>
                <td className="py-1.5 text-right">{vr.stops.length}</td>
                <td className="py-1.5 text-right">
                  <span className=""> {vr.totalDistanceKm.toFixed(1)} km </span>
                </td>
                <td className="py-1.5 text-right">
                  <span className="">{formatMinutes(vr.totalTravelTime)}</span>
                </td>
                <td className="py-1.5 text-right">
                  <span className="">{formatMinutes(vr.totalTravelTime)}</span>
                </td>
                <td className="py-1.5 text-right">
                  <span className="">{vr.estimatedPrice.toFixed(1)} zł</span>
                </td>
              </tr>
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
