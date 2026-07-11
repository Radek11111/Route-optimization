"use client";

import Link from "next/link";


import { useRoutes } from "../api/useRoutes";
import { CreateRouteDialog } from "./CreateRouteDialog";
import { Button } from "@/components/ui/button";

export function RoutesListClient() {
  const { data: routes, isLoading, isError } = useRoutes();

  if (isLoading) return <div className="p-8">Ładowanie tras...</div>;
  if (isError)
    return <div className="p-8 text-red-500">Błąd pobierania tras.</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Trasy</h1>

        <CreateRouteDialog />
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Nazwa</th>
              <th className="px-4 py-3 text-left font-medium">Punkty</th>
              <th className="px-4 py-3 text-left font-medium">Pojazdy</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Utworzona</th>
              <th className="px-4 py-3 text-left font-medium">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {routes?.map((route: any) => (
              <tr
                key={route.id}
                className="border-b hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 font-medium">
                  {route.name ?? "Bez nazwy"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {route._count.points}
                </td>
                <td className="px-4 py-3 ">{route.vehicleCount}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5">
                    {route.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {new Date(route.createdAt).toLocaleDateString()}
                </td>
                
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm">
                    <Link
                      href={`/dispatcher/routes/${route.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Szczegóły
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
