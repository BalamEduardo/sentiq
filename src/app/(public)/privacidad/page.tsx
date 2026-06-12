export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-950 sm:px-6 sm:py-16">
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
            Aviso de privacidad provisional
          </p>
          <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
            Privacidad de la encuesta SentiQ
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Esta pagina explica, en lenguaje simple, como se tratan los datos
            capturados en las encuestas publicas usadas por restaurantes durante
            el piloto de SentiQ.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Que datos se capturan</h2>
          <p className="leading-7 text-slate-700">
            La encuesta captura calificaciones sobre la experiencia en el
            restaurante, un comentario opcional y, si el cliente decide
            compartirlo, un telefono opcional para seguimiento.
          </p>
          <p className="leading-7 text-slate-700">
            La encuesta no pide nombre ni correo electronico.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Uso del telefono opcional</h2>
          <p className="leading-7 text-slate-700">
            El telefono no es obligatorio. Si el cliente lo escribe, tambien
            debe aceptar el consentimiento mostrado en la encuesta. Ese telefono
            se usa solo para que el restaurante pueda dar seguimiento al
            comentario recibido.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Para que sirven las respuestas</h2>
          <p className="leading-7 text-slate-700">
            Las respuestas ayudan al restaurante a entender la experiencia de
            sus clientes y a mejorar su servicio, atencion, tiempos y calidad.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Responsable provisional</h2>
          <p className="leading-7 text-slate-700">
            Durante el piloto, el responsable provisional del tratamiento de la
            informacion es el restaurante que solicita la opinion mediante la
            encuesta SentiQ. SentiQ opera como herramienta tecnica para capturar
            y entregar esas respuestas al restaurante.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Revision legal</h2>
          <p className="leading-7 text-slate-700">
            Este aviso es provisional para la fase piloto. Antes de una venta
            formal o una expansion del piloto, el aviso y los procesos de
            privacidad deberan pasar por una revision legal.
          </p>
        </section>
      </article>
    </main>
  );
}
