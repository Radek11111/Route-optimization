import { RouteMap } from "@/features/routes/components/map/RouteMapWrapper";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function MapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const solution = await prisma.solution.findFirst({
    where: { routeId: id },
    orderBy: { createdAt: "desc" },
    include: {
      vehicleRoutes: {
        include: {
          stops: {
            orderBy: { order: "asc" },
            include: { point: true },
          },
        },
      },
      route: {
        include: { depotPoint: true },
      },
    },
  });

  if (!solution || !solution.route.depotPoint) {
    notFound();
  }

  const depot = {
    id: solution.route.depotPoint.id,
    name: solution.route.depotPoint.name,
    latitude: solution.route.depotPoint.latitude,
    longitude: solution.route.depotPoint.longitude,
  };

  const vehicleRoutes = solution.vehicleRoutes.map((vr) => ({
    vehicleIndex: vr.vehicleIndex,
    stops: vr.stops.map((s) => ({
      id: s.point.id,
      name: s.point.name,
      latitude: s.point.latitude,
      longitude: s.point.longitude,
    })),
  }));

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <RouteMap
        depot={depot}
        vehicleRoutes={vehicleRoutes}
        returnToDepot={solution.route.returnToDepot}
      />
    </div>
  );
}
