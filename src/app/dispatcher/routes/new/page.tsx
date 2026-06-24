import { RouteForm } from "@/features/routes/components/RouteForm";

export default function NewRoutePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Nowa trasa</h1>
      <RouteForm />
    </div>
  );
}
