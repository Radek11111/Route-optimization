"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider } from "react-hook-form";
import { useCreateRoute } from "../api/useCreateRoute";

import { CreateRouteInput } from "@/modules/routes/schemas/create-route.schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouteForm } from "@/features/hook/useRouteForm";
import { RouteFormFields } from "./RouteFormFields";


export function CreateRouteDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { mutate, isPending } = useCreateRoute();

  const form = useRouteForm();

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
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-2"
          >
            <RouteFormFields />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Tworzenie..." : "Utwórz trasę"}
            </Button>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
