"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CreateRouteInput } from "@/modules/routes/schemas/create-route.schema";
import { Controller, useFormContext } from "react-hook-form";
import { BadgeInfo } from "lucide-react";

const DRIVER_MODE_LABELS: Record<CreateRouteInput["driverMode"], string> = {
  TRUCK: "Ciężarówka (reguły 561/2006)",
  COURIER: "Kurier / dostawca",
  NONE: "Bez ograniczeń",
};

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

function LabelWithInfo({ label, info }: { label: string; info: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              aria-label={`Więcej informacji: ${label}`}
            >
              <BadgeInfo className="h-3.5 w-3.5" />
            </button>
          }
        />
        <PopoverContent className="w-64 text-xs text-muted-foreground">
          {info}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function RouteFormFields() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<CreateRouteInput>();

  const driverMode = watch("driverMode");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Nazwa trasy</Label>
        <Input {...register("name")} placeholder="Wprowadź nazwę trasy" />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Opis</Label>
        <Input {...register("description")} placeholder="Opcjonalny opis" />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
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
          <p className="text-sm text-red-500">{errors.vehicleCount.message}</p>
        )}
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
        {errors.ratePerKm && (
          <p className="text-sm text-red-500">{errors.ratePerKm.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Początek zmiany</Label>
          <Controller
            control={control}
            name="workStartMinutes"
            render={({ field }) => (
              <Input
                type="time"
                value={minutesToTime(field.value)}
                onChange={(e) => field.onChange(timeToMinutes(e.target.value))}
                onBlur={field.onBlur}
              />
            )}
          />
          {errors.workStartMinutes && (
            <p className="text-sm text-red-500">
              {errors.workStartMinutes.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <LabelWithInfo
            label="Koniec zmiany"
            info="Twarda godzina — kierowca nie może pracować po tej godzinie, nawet jeśli nie wyczerpał limitu aktywnego czasu pracy poniżej."
          />
          <Controller
            control={control}
            name="workEndMinutes"
            render={({ field }) => (
              <Input
                type="time"
                value={minutesToTime(field.value)}
                onChange={(e) => field.onChange(timeToMinutes(e.target.value))}
                onBlur={field.onBlur}
              />
            )}
          />
          {errors.workEndMinutes && (
            <p className="text-sm text-red-500">
              {errors.workEndMinutes.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <LabelWithInfo
          label="Maks. aktywny czas pracy (minuty)"
          info="Suma jazdy, obsługi i oczekiwania — niezależnie od pory dnia. Odrębne od godziny końca zmiany powyżej."
        />
        <Input
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
          type="checkbox"
          id="returnToDepot"
          {...register("returnToDepot")}
        />
        <Label htmlFor="returnToDepot">Powrót do bazy</Label>
      </div>

      <div className="space-y-2">
        <Label>Tryb kierowcy</Label>
        <Controller
          control={control}
          name="driverMode"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DRIVER_MODE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.driverMode && (
          <p className="text-sm text-red-500">{errors.driverMode.message}</p>
        )}
      </div>

      {driverMode === "COURIER" && (
        <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-border">
          <div className="space-y-2">
            <Label>Przerwa po (minuty)</Label>
            <Input
              type="number"
              min={1}
              {...register("courierBreakAfterMinutes", {
                valueAsNumber: true,
              })}
            />
            {errors.courierBreakAfterMinutes && (
              <p className="text-sm text-red-500">
                {errors.courierBreakAfterMinutes.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Długość przerwy (minuty)</Label>
            <Input
              type="number"
              min={1}
              {...register("courierBreakDurationMinutes", {
                valueAsNumber: true,
              })}
            />
            {errors.courierBreakDurationMinutes && (
              <p className="text-sm text-red-500">
                {errors.courierBreakDurationMinutes.message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
