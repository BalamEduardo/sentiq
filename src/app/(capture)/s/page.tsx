import { Suspense } from "react";

import { CaptureTokenLabel } from "../capture-token-label";

export default function BranchSurveyPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-normal">
        Encuesta por QR
      </h1>
      <p className="text-muted-foreground">
        Placeholder para la encuesta publica de sucursal.
      </p>
      <Suspense fallback={null}>
        <CaptureTokenLabel />
      </Suspense>
    </main>
  );
}
