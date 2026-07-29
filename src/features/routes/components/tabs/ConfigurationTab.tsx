"use client";

import React from "react";
import { useRoute } from "../../api/useRoute";

type Props = {
  routeId: string;
};

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function Section({ title }: { title: string }) {
  return (
    <p className="text-sm font-medium tetx-muded-foreground uppercase tracking-wide mt-4 mb-2">
      {title}
    </p>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm border-b border-border/50">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export function ConfigurationTab({ routeId }: Props) {
  const { data: route, isLoading } = useRoute(routeId);

  if (isLoading)
    return (
      <div className="p-4 text-sm text-muted-foreground"> Ładowanie...</div>
    );
  if (!route) return null;

  return (
    <div className="p-4">
      <Section title="Podstawowe" />
      <Row label="Pojazdy" value={route.vehicleCount} />
      <Row
        label="Stawka / km"
        value={route.ratePerKm ? `${route.ratePerKm.toFixed(2)} zł` : " - "}
      />
      <Row label="Powrót do bazy" value={route.returnToDepot ? "Tak" : "Nie"} />
      <Section title="Czas pracy" />
      <Row label="Początek" value={minutesToTime(route.workStartMinutes)} />
      <Row label="Koniec" value={minutesToTime(route.workEndMinutes)} />
      <Row
        label="Maks. czas pracy"
        value={`${Math.round(route.maxWorkDurationMinutes / 60)}h ${route.breakAfterMinutes % 60}m`}
      />

      {route.breakAfterMinutes && (
        <>
          <Section title="Przerwa" />
          <Row
            label="Po"
            value={`${Math.round(route.breakAfterMinutes / 60)}h ${route.breakAfterMinutes % 60}m`}
          />
          <Row
            label="Czas Przerwy"
            value={`${route.breakDurationMinutes} min`}
          />
        </>
      )}

      <Section title="Depot" />
      <Row label="Adres" value={route.depotPoint?.name ?? "Nie ustawiony"} />

      <button className="mt-4 w-full rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
        ✎ Edytuj konfigurację ↗
      </button>
    </div>
  );
}
