import { LoadingState } from "@/components/shared";

export default function BranchSurveyLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <LoadingState
        title="Cargando encuesta"
        description="Estamos preparando la experiencia para responder."
        className="w-full max-w-lg"
      />
    </main>
  );
}
