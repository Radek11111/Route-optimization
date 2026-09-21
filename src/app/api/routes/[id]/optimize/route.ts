import { createMatrixProvider } from "@/domain/matrix/factory/createMatrixProvider";
import { optimizeRateLimit } from "@/lib/rateLimit";
import { saveFailedSolution } from "@/modules/optimization/repositories/optimization-repository";
import { runOptimizationService } from "@/modules/routes/services/run-optimatization.service";
import { saveOptimizationResultService } from "@/modules/routes/services/save-OptimizationResult.service";
import { successResponse } from "@/shared/utils/api-response";

import { requireRouteOwner } from "@/shared/utils/require-route-owner";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  const { id } = await params;
  try {
    const auth = await requireRouteOwner(id);
    if (!auth.ok) return auth.response;

    const { success, limit, remaining, reset } = await optimizeRateLimit.limit(
      auth.userId,
    );
    if (!success) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many optimization requests. Try again later.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        },
      );
    }

    const matrixProvider = createMatrixProvider();

    const {
      dto,
      solution,
      domainPoints,
      depotDomainPoint,
      totalDistanceKm,
      estimatedPrice,
      naiveDistanceKm,
      savedDistanceKm,
      savedPercent,
      vehicleStats,
      solutionBreakdown,
    } = await runOptimizationService(id, matrixProvider);
    await saveOptimizationResultService(
      id,
      solution,
      domainPoints,
      depotDomainPoint,
      totalDistanceKm,
      estimatedPrice,
      naiveDistanceKm,
      savedDistanceKm,
      savedPercent,
      vehicleStats,
      solutionBreakdown,
    );
    return successResponse(dto, 200);
  } catch (error) {
    const detailedMessage =
      error instanceof Error ? error.message : "Unknown error";

    try {
      await saveFailedSolution(id, detailedMessage);
    } catch (persistError) {
      console.error("Failed to persist FAILED solution record:", persistError);
    }

    console.error("Optimization failed:", error);

    const isUserError =
      error instanceof Error &&
      [
        "Route not found",
        "Depot not configured",
        "Route has no points",
      ].includes(error.message);

    return NextResponse.json(
      {
        success: false,
        message: isUserError ? error.message : "Optimization failed",
      },
      { status: isUserError ? 400 : 500 },
    );
  }
}
