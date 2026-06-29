// import { PointForm } from "@/features/routes/components/PointForm";
// import { PointsListClient } from "@/features/routes/components/PointsListClient";
// import { RouteActions } from "@/features/routes/components/RouteActions";
// import Link from "next/link";

// export default async function RouteDetailPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const { id } = await params;
//   return (
//     <div className="p-8 space-y-8">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold">Szczegóły trasy</h1>
//         <div className="flex gap-3">
//           <RouteActions routeId={id} />
//           <Link
//             href={`/dispatcher/routes/${id}/map`}
//             className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
//           >
//             Zobacz mapę
//           </Link>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-8">
//         <div className="space-y-4">
//           <h2 className="text-lg font-semibold">Dodaj punkt</h2>
//           <PointForm routeId={id} />
//         </div>

//         <div className="space-y-4">
//           <h2 className="text-lg font-semibold">Punkty trasy</h2>
//           <PointsListClient routeId={id} />
//         </div>
//       </div>
//     </div>
//   );
// }
