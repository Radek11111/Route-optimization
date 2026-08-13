"use client";

import { Trash2 } from "lucide-react";
import { useDeletePoint } from "../../api/useDeletePoint";
import { usePoints } from "../../api/usePoints";
import { PointForm } from "../PointForm";

type Props = {
  routeId: string;
};

export function PointsTab({ routeId }: Props) {
  const { data: points, isLoading } = usePoints(routeId);
  const { mutate: deletePoint } = useDeletePoint(routeId);

  return (
    <div className="flex flex-col">
      <div className="p-3 border-b">
        <p className="text-xs text-muted-foreground mb-2">
          {points?.length ?? 0} punktów
        </p>
        <div className="space-y-1">
          {isLoading && (
            <p className="text-xs text-muted-foreground">Ładowanie...</p>
          )}
          {points?.map((point, index) => (
            <div
              key={point.id}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted text-sm"
            >
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0">
                {index + 1}
              </span>
              <span className="flex-1 truncate">
                {point.name ?? `${point.latitude}, ${point.longitude}`}
              </span>
              <span className="text-xs text-muted-foreground shrink-0">
                {point.serviceTimeMinutes > 0
                  ? `${point.serviceTimeMinutes} min`
                  : ""}
              </span>
              <button className="shrink-0 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer">
                <Trash2 size={15} onClick={() => deletePoint(point.id)} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          + Dodaj punkt
        </p>
        <PointForm routeId={routeId} />
      </div>
    </div>
  );
}
