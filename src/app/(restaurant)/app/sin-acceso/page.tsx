import { EmptyState } from "@/components/shared";

export default function RestaurantAccessDeniedPage() {
  return (
    <EmptyState
      title="Sin acceso"
      description="No tienes permisos para ver esta seccion. Solicita apoyo a un administrador."
      className="min-h-96 border-solid shadow-sm"
    />
  );
}
