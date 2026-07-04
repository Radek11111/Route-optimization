"use client";
import { useRouter } from "next/navigation";
import { useOptimize } from "../api/useOptimize";

type Props = {
  routeId: string;
};

export function RouteActions({ routeId }: Props) {
  const router = useRouter();
  const { mutate, isPending } = useOptimize(routeId);

  function handleOptimize() {
    mutate(undefined, {
      onSuccess: () => {
        router.push(`/dispatcher/routes/${routeId}/map`);
      },
    });
  }

  return (
    <button
      onClick={handleOptimize}
      disabled={isPending}
      className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
    >
      {isPending ? "Optymalizowanie..." : "Optymalizuj"}
    </button>
  );
}
