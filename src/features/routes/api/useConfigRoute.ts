
import { CreateRouteInput } from "@/modules/routes/schemas/create-route.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function configRoute(routeId: string, input: CreateRouteInput) {
  const response = await fetch(`/api/routes/${routeId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Błąd podczas konfiguracji trasy");
  }
  return response.json();
}

export function useConfigRoute(routeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRouteInput) => configRoute(routeId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes", routeId] });
    },
  });
}
