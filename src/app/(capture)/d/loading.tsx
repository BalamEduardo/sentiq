import { LoadingState } from "@/components/shared";

export default function DeviceSurveyLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <LoadingState
        title="Preparando dispositivo"
        description="Estamos cargando la encuesta del restaurante."
        className="w-full max-w-lg"
      />
    </main>
  );
}
