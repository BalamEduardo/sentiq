import { EmptyState } from "@/components/shared";

export default function PlatformAccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <EmptyState
        title="Sin acceso"
        description="No tienes permisos para ver esta área administrativa."
        className="w-full max-w-lg border-solid shadow-sm"
      />
    </main>
  );
}
