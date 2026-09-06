
import { CreateRouteInput } from "@/modules/routes/schemas/create-route.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function createRoute(input: CreateRouteInput) {
  const response = await fetch("/api/routes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Błąd podczas tworzenia trasy");
  }
  return response.json();
}

export function useCreateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });
}
