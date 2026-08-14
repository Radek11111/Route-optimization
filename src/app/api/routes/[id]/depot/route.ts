import { setRouteDepotService } from "@/modules/routes/services/set-route-depot.service";
import { errorResponse, successResponse } from "@/shared/utils/api-response";
import { auth } from "@clerk/nextjs/server";

import { NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({
  pointId: z.string(),
});

export async function PUT(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
     const { userId } = await auth();
     if (!userId) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const parsed = schema.parse(body);

    const { id } = await params;
    const route = await setRouteDepotService(id, parsed.pointId);

    return successResponse(route, 200);
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }
    return errorResponse("Failed to set route depot", 500);
  }
}
