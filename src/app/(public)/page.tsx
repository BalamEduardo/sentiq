import { Button } from "@/components/ui/button";

export default function PublicHomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-16">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-medium text-muted-foreground">SentiQ</p>
        <h1 className="text-4xl font-semibold tracking-normal">
          Feedback para restaurantes
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Base tecnica inicial para construir la fase 2 del producto.
        </p>
        <div className="flex">
          <Button>Continuar</Button>
        </div>
      </section>
    </main>
  );
}
