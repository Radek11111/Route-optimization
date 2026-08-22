import { createMatrixProvider } from "@/domain/matrix/factory/createMatrixProvider";
import { optimizeRateLimit } from "@/lib/rateLimit";
import { getRouteById } from "@/modules/routes/repositories/route-repository";
import { runOptimizationService } from "@/modules/routes/services/run-optimatization.service";
import { saveOptimizationResultService } from "@/modules/routes/services/save-OptimizationResult.service";
import { requireRouteOwner } from "@/shared/utils/require-route-owner";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await params;
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
    return NextResponse.json({
      success: true,
      data: dto,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
}
