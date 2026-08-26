import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCreateRoute } from "../api/useCreateRoute";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { createRouteSchema } from "@/modules/routes/schemas/create-route.schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const mins = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
}

function timeToMinutes(time: string): number {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

export function CreateRouteDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { mutate, isPending } = useCreateRoute();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateRouteInput>({
    resolver: zodResolver(createRouteSchema),
    defaultValues: {
      vehicleCount: 1,
      workStartMinutes: 480,
      workEndMinutes: 1020,
      maxWorkDurationMinutes: 480,
      returnToDepot: false,
      ratePerKm: undefined,
    },
  });

  function onSubmit(data: CreateRouteInput) {
    mutate(data, {
      onSuccess: (response) => {
        setIsOpen(false);
        router.push(`/dispatcher/routes/${response.data.id}`);
      },
    });
  }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <div className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Nowa trasa
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nowa trasa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Nazwa trasy</Label>
            <Input {...register("name")} placeholder="Wprowadź nazwę trasy" />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Liczba pojazdów</Label>
            <Input
              type="number"
              min={1}
              {...register("vehicleCount", { valueAsNumber: true })}
            />
            {errors.vehicleCount && (
              <p className="text-sm text-red-500">
                {errors.vehicleCount.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Początek pracy</Label>
              <Input
                type="time"
                defaultValue={minutesToTime(480)}
                onChange={(e) =>
                  setValue("workStartMinutes", timeToMinutes(e.target.value))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Koniec pracy</Label>
              <Input
                type="time"
                defaultValue={minutesToTime(1020)}
                onChange={(e) =>
                  setValue("workEndMinutes", timeToMinutes(e.target.value))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Maks. czas pracy (min)</Label>
            <Input
              type="number"
              min={0}
              {...register("maxWorkDurationMinutes", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label>Stawka za km (zł)</Label>
            <Input
              type="number"
              step="0.01"
              min={0}
              {...register("ratePerKm", { valueAsNumber: true })}
              placeholder="np. 2.50"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="returnToDepot"
              {...register("returnToDepot")}
            />
            <Label htmlFor="returnToDepot">Powrót do bazy</Label>
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Tworzenie..." : "Utwórz trasę"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
