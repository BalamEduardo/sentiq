"use client";

import Link from "next/link";

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
            title="Algo salio mal"
            description="No pudimos mostrar esta pantalla. Intenta de nuevo en unos segundos."
            retryLabel="Intentar de nuevo"
            onRetry={reset}
            secondaryAction={
              <Link
                href="/"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-slate-400/25"
              >
                Volver al inicio
              </Link>
            }
            className="w-full max-w-lg"
          />
        </main>
      </body>
    </html>
  );
}
