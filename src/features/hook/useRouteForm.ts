"use client";

import {
  CreateRouteInput,
  createRouteSchema,
} from "@/modules/routes/schemas/create-route.schema";
import { RouteType } from "@/types/RouteType";
import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver, useForm } from "react-hook-form";

const DEFAULT_VALUES: CreateRouteInput = {
  name: "",
  description: undefined,
  vehicleCount: 1,
  workStartMinutes: 480,
  workEndMinutes: 1020,
  maxWorkDurationMinutes: 480,
  returnToDepot: false,
  ratePerKm: undefined,
  driverMode: "TRUCK",
  courierBreakAfterMinutes: undefined,
  courierBreakDurationMinutes: undefined,
};

function mapRouteToFormValues(route: RouteType): CreateRouteInput {
  return {
    name: route.name ?? "",
    description: route.description ?? undefined,
    vehicleCount: route.vehicleCount,
    workStartMinutes: route.workStartMinutes,
    workEndMinutes: route.workEndMinutes,
    maxWorkDurationMinutes: route.maxWorkDurationMinutes,
    returnToDepot: route.returnToDepot,
    ratePerKm: route.ratePerKm ?? undefined,
    driverMode: route.driverMode,
    courierBreakAfterMinutes: route.courierBreakAfterMinutes ?? undefined,
    courierBreakDurationMinutes: route.courierBreakDurationMinutes ?? undefined,
  };
}

export function useRouteForm(route?: RouteType) {
  return useForm<CreateRouteInput>({
    resolver: zodResolver(createRouteSchema) as Resolver<CreateRouteInput>,
    ...(route
      ? { values: mapRouteToFormValues(route) }
      : { defaultValues: DEFAULT_VALUES }),
  });
}
