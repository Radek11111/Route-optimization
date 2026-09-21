import { Route } from "@/generated/prisma/client";
import { Point } from "@/types/Point";
import { useQuery } from "@tanstack/react-query";

type RouteWithRelations = Route & {
  depotPoint: Point | null;
  _count: { points: number };
};

async function fetchRoute(routeId: string): Promise<RouteWithRelations> {
  const response = await fetch(`/api/routes/${routeId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch route");
  }

  const data = await response.json();
  return data.data;
}

export function useRoute(routeId: string) {
  return useQuery({
    queryKey: ["routes", routeId],
    queryFn: () => fetchRoute(routeId),
  });
}
