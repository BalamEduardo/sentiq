import { ErrorState } from "@/components/shared/error-state";

export default function InvalidSurveyLinkPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <ErrorState
        title="Enlace no disponible"
        description="Este enlace no está disponible. Por favor solicita apoyo al restaurante."
        className="w-full max-w-lg bg-white shadow-sm"
      />
    </main>
  );
}
