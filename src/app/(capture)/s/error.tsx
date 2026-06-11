"use client";

import { ErrorState } from "@/components/shared";

type BranchSurveyErrorProps = {
  reset: () => void;
};

export default function BranchSurveyError({ reset }: BranchSurveyErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <ErrorState
        title="No pudimos cargar la encuesta"
        description="Este enlace no está disponible. Solicita apoyo al restaurante."
        retryLabel="Intentar de nuevo"
        onRetry={reset}
        className="w-full max-w-lg"
      />
    </main>
  );
}
