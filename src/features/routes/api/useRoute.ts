import { useQuery } from "@tanstack/react-query";

async function fetchRoute(routeId: string) {
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
