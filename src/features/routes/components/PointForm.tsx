"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPointSchema } from "@/modules/points/schemas/create-point.schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSetDepot } from "../api/useSetDepot";
import { z } from "zod";
import { useCreatePoint } from "../api/useCreatePoint";
import { useAddressSearch } from "../../hook/useAddressSearch";
import { useState } from "react";

type Props = {
  routeId: string;
};

const pointFormSchema = createPointSchema.extend({
  isDepot: z.boolean(),
});

type PointFormValues = z.infer<typeof pointFormSchema>;

export function PointForm({ routeId }: Props) {
  const { mutateAsync, isPending, isError } = useCreatePoint(routeId);
  const { mutate: setDepot } = useSetDepot(routeId);
  const { query, setQuery, results, isLoading, setResults } =
    useAddressSearch();
  const [selectedAddress, setSelectedAddress] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PointFormValues>({
    resolver: zodResolver(pointFormSchema),
    defaultValues: {
      serviceTimeMinutes: 0,
      priority: 1,
      isDepot: false,
    },
  });

  function handleSelectAddress(result: {
    display_name: string;
    lat: string;
    lon: string;
  }) {
    setValue("latitude", parseFloat(result.lat));
    setValue("longitude", parseFloat(result.lon));
    setSelectedAddress(result.display_name);
    setQuery("");
    setResults([]);
  }

  async function onSubmit(data: PointFormValues) {
    const { isDepot, ...pointData } = data;
    try {
      const response = await mutateAsync(pointData);
      if (isDepot) setDepot(response.data.id);
      reset();
      setSelectedAddress("");
    } catch (error) {
      console.error("Error adding point:", error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Nazwa punktu</Label>
        <Input {...register("name")} placeholder="np. Klient A" />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>


      <div className="space-y-2 relative">
        <Label>Adres</Label>
        <Input
          value={selectedAddress || query}
          onChange={(e) => {
            setSelectedAddress("");
            setQuery(e.target.value);
          }}
          placeholder="np. ul. Marszałkowska 1, Warszawa"
        />
        {isLoading && (
          <p className="text-xs text-muted-foreground">Szukanie...</p>
        )}
        {results.length > 0 && (
          <div className="absolute z-50 w-full bg-background border rounded-md shadow-lg mt-1">
            {results.map((result) => (
              <button
                key={result.place_id}
                type="button"
                onClick={() => handleSelectAddress(result)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted border-b last:border-0 truncate"
              >
                {result.display_name}
              </button>
            ))}
          </div>
        )}
        {errors.latitude && (
          <p className="text-sm text-red-500">Wybierz adres z listy</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Czas obsługi (min)</Label>
          <Input
            type="number"
            min={0}
            {...register("serviceTimeMinutes", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label>Priorytet (1-10)</Label>
          <Input
            type="number"
            min={1}
            max={10}
            {...register("priority", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="isDepot" {...register("isDepot")} />
        <Label htmlFor="isDepot">Ustaw jako depot (baza)</Label>
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
