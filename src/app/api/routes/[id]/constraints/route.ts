import { createConstraintSchema } from "@/modules/constraints/create-constraint.schema";
import { getConstraintByRouteId } from "@/modules/routes/repositories/constraint-repository";
import { upsertConstraintService } from "@/modules/routes/services/upsert-constraint.service";
import { errorResponse, successResponse } from "@/shared/utils/api-response";
import { NextRequest } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = await req.json();

    const parsed = createConstraintSchema.parse(body);

    const { id } = await params;

    const constraint = await upsertConstraintService({
      ...parsed,
      routeId: id,
    });

    return successResponse(constraint, 200);
  } catch (error) {
    console.error("Error upserting constraint:", error);
    return errorResponse("Failed to upsert constraint. ", 500);
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const constraint = await getConstraintByRouteId(id);

    return successResponse(constraint, 200);
  } catch (error) {
    console.error("Error fetching constraint:", error);
    return errorResponse("Failed to fetch constraint.", 500);
  }
}
