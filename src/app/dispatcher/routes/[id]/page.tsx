import { RouteDetailPage } from "@/features/routes/components/RouteDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RouteDetailPage routeId={id} />;
}
