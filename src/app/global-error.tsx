"use client";

import { ErrorState } from "@/components/shared";

type GlobalErrorProps = {
  reset: () => void;
};

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="es">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
          <ErrorState
            title="Algo salió mal"
            description="No pudimos mostrar esta pantalla. Intenta de nuevo en unos segundos."
            retryLabel="Intentar de nuevo"
            onRetry={reset}
            className="w-full max-w-lg"
          />
        </main>
      </body>
    </html>
  );
}
