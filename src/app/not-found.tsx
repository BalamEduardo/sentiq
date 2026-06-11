import { EmptyState } from "@/components/shared";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <EmptyState
        title="Página no encontrada"
        description="La página que buscas no está disponible o cambió de ubicación."
        className="w-full max-w-lg border-solid shadow-sm"
      />
    </main>
  );
}
