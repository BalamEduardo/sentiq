import Link from "next/link";

import { EmptyState } from "@/components/shared";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <EmptyState
        title="Pagina no encontrada"
        description="La pagina que buscas no esta disponible o cambio de ubicacion."
        action={
          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-orange-600 px-3 text-sm font-medium text-white transition hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-orange-600/25"
          >
            Volver al inicio
          </Link>
        }
        className="w-full max-w-lg border-solid shadow-sm"
      />
    </main>
  );
}
