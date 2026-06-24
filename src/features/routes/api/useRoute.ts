import { Route } from "@/types/Route";
import { useQuery } from "@tanstack/react-query";

async function fetchRoutes(): Promise<Route[]> {
  const response = await fetch("/api/routes");

  if (!response.ok) {
    throw new Error(`Failed to fetch routes: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}

export function useRoute() {
  return useQuery({
    queryKey: ["routes"],
    queryFn: fetchRoutes,
  });
}
