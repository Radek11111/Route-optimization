"use client";

import { useRouter } from "next/navigation";
import { useCreateRoute } from "../api/useCreateRoute";
import { useForm } from "react-hook-form";
import {
  CreateRouteInput,
  createRouteSchema,
} from "@/modules/routes/schemas/create-route.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


export function RouteForm() {
  const router = useRouter();
  const { mutate, isPending, isError } = useCreateRoute();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRouteInput>({
    resolver: zodResolver(createRouteSchema),
    defaultValues: {
      vehicleCount: 1,
      workStartMinutes: 480,
      workEndMinutes: 1020,
      maxWorkDurationMinutes: 480,
      returnToDepot: false,
    },
  });

  function onSubmit(data: CreateRouteInput) {
    mutate(data, {
      onSuccess: (response) => {
        router.push(`/dispatcher/routes/${response.data.id}/routeDetails`);
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="name">Nazwa Trasy</Label>
        <Input id="name" {...register("name")} placeholder="Nazwa trasy" />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Opis</Label>
        <Input
          id="description"
          {...register("description")}
          placeholder="Opcjonalny opis"
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="vehicleCount">Liczba pojazdów</Label>
        <Input
          id="vehicleCount"
          type="number"
          min={1}
          {...register("vehicleCount", { valueAsNumber: true })}
        />
        {errors.vehicleCount && (
          <p className="text-sm text-red-500">{errors.vehicleCount.message}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="workStart">Początek pracy</Label>
          <Input
            id="workStart"
            type="time"
            defaultValue={minutesToTime(480)}
            onChange={(e) => {
              const minutes = timeToMinutes(e.target.value);
              register("workStartMinutes").onChange({
                target: { value: minutes, name: "workStartMinutes" },
              });
            }}
          />
          {errors.workStartMinutes && (
            <p className="text-sm text-red-500">
              {errors.workStartMinutes.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="workEnd">Koniec pracy</Label>
          <Input
            id="workEnd"
            type="time"
            defaultValue={minutesToTime(1020)}
            onChange={(e) => {
              const minutes = timeToMinutes(e.target.value);
              register("workEndMinutes").onChange({
                target: { value: minutes, name: "workEndMinutes" },
              });
            }}
          />
          {errors.workEndMinutes && (
            <p className="text-sm text-red-500">
              {errors.workEndMinutes.message}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxWorkDuration">Maks. czas pracy (minuty)</Label>
        <Input
          id="maxWorkDuration"
          type="number"
          min={0}
          {...register("maxWorkDurationMinutes", { valueAsNumber: true })}
        />
        {errors.maxWorkDurationMinutes && (
          <p className="text-sm text-red-500">
            {errors.maxWorkDurationMinutes.message}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          id="returnToDepot"
          type="checkbox"
          {...register("returnToDepot")}
        />
        <Label htmlFor="returnToDepot">Powrót do bazy</Label>
      </div>

      {isError && (
        <p className="text-sm text-red-500">
          Błąd tworzenia trasy. Spróbuj ponownie.
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Tworzenie..." : "Utwórz trasę"}
      </Button>
    </form>
  );
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
