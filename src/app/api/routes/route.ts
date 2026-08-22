import {
  getRoutesByUserId,
  updateRoute,
} from "@/modules/routes/repositories/route-repository";
import { createRouteSchema } from "@/modules/routes/schemas/create-route.schema";
import { createRouteService } from "@/modules/routes/services/create-route.service";
import { errorResponse, successResponse } from "@/shared/utils/api-response";
import {
  requireAuth,
  requireRouteOwner,
} from "@/shared/utils/require-route-owner";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const parsed = createRouteSchema.parse(body);

    const route = await createRouteService({
      ...parsed,
      userId: auth.userId,
    });
    return successResponse(route, 200);
  } catch (error) {
    console.error("Error creating route:", error);

    return errorResponse("Failed to create route", 500);
  }
}

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const routes = await getRoutesByUserId(auth.userId);

    return successResponse(routes, 200);
  } catch (error) {
    console.error("Error fetching routes:", error);

    return errorResponse("Failed to fetch routes", 400);
  }
}
