"use client";

import { useForm } from "react-hook-form";
import { useCreatePoint } from "../api/useCreatePoint";
import { CreatePointInput } from "@/types/CreatePoint";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPointSchema } from "@/modules/points/schemas/create-point.schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";

type Props = {
  routeId: string;
};

export function PointForm({ routeId }: Props) {
  const { mutate, isPending, isError } = useCreatePoint(routeId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePointInput>({
    resolver: zodResolver(createPointSchema),
    defaultValues: {
      serviceTimeMinutes: 0,
      priority: 1,
    },
  });

  function onSubmit(data: CreatePointInput) {
    mutate(data, {
      onSuccess: () => reset(),
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nazwa punltu</Label>
        <Input id="name" {...register("name")} placeholder="Klient A" />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Szerokosc geograficzna</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            {...register("latitude", { valueAsNumber: true })}
            placeholder="52.2297"
          />
          {errors.latitude && (
            <p className="text-sm text-red-500">{errors.latitude.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Długość geograficzna</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            {...register("longitude", { valueAsNumber: true })}
            placeholder="21.0122"
          />
          {errors.longitude && (
            <p className="text-sm text-red-500">{errors.longitude.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="serviceTimeMinutes">Czas obsługi (min)</Label>
          <Input
            id="serviceTimeMinutes"
            type="number"
            min={0}
            {...register("serviceTimeMinutes", { valueAsNumber: true })}
          />
          {errors.serviceTimeMinutes && (
            <p className="text-sm text-red-500">
              {errors.serviceTimeMinutes.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priorytet (1-10)</Label>
          <Input
            id="priority"
            type="number"
            min={1}
            max={10}
            {...register("priority", { valueAsNumber: true })}
          />
          {errors.priority && (
            <p className="text-sm text-red-500">{errors.priority.message}</p>
          )}
        </div>
      </div>

      {isError && (
        <p className="text-sm text-red-500">Błąd dodawania punktu.</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Dodawanie..." : "Dodaj punkt"}
      </Button>
    </form>
  );
}
