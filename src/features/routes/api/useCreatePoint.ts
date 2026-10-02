import { CreatePointInput } from "@/types/CreatePoint";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function createPoint(routeId: string, input: CreatePointInput) {

  const response = await fetch(`/api/routes/${routeId}/points`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error("Failed to create point");
  return response.json();
}

export function useCreatePoint(routeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePointInput) => createPoint(routeId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["points", routeId] });
    },
  });
}
