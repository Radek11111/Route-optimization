import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

async function fetchRoutes() {
  const response = await fetch("/api/routes");
  if (!response.ok) throw new Error("Failed to fetch routes");
  const data = await response.json();
  return data.data;
}

export function useRoutes() {
  const { isLoaded, isSignedIn } = useAuth();
  return useQuery({
    queryKey: ["routes"],
    queryFn: fetchRoutes,
    enabled: isLoaded && isSignedIn,
  });
}
