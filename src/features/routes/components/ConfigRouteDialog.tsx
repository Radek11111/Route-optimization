"use client";

import { useState } from "react";
import { FormProvider } from "react-hook-form";
import { useConfigRoute } from "../api/useConfigRoute";
import { useRoute } from "../api/useRoute";

import { CreateRouteInput } from "@/modules/routes/schemas/create-route.schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouteForm } from "@/features/hook/useRouteForm";
import { RouteFormFields } from "./RouteFormFields";


type Props = {
  routeId: string;
};

export function ConfigRouteDialog({ routeId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: route } = useRoute(routeId);
  const { mutate, isPending } = useConfigRoute(routeId);

  const form = useRouteForm(route);

  function onSubmit(data: CreateRouteInput) {
    mutate(data, {
      onSuccess: () => setIsOpen(false),
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <div className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          ✎ Konfiguruj trasę ↗
        </div>
      </DialogTrigger>
      <DialogContent className="z-1000">
        <DialogHeader>
          <DialogTitle>✎ Konfiguruj trasę ↗</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-2"
          >
            <RouteFormFields />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
