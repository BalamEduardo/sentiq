"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { getPostLoginRedirect, getCurrentSessionProfile } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const genericLoginError =
  "No pudimos iniciar sesion. Revisa tus datos o solicita acceso al administrador.";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormErrors = {
  email?: string;
  password?: string;
};

function validateLoginForm(email: string, password: string): FormErrors {
  const nextErrors: FormErrors = {};
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    nextErrors.email = "Ingresa tu correo electronico.";
  } else if (!emailPattern.test(normalizedEmail)) {
    nextErrors.email = "Ingresa un correo electronico valido.";
  }

  if (!password) {
    nextErrors.password = "Ingresa tu contrasena.";
  }

  return nextErrors;
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResolvingSession, setIsResolvingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function redirectExistingSession() {
      const sessionState = await getCurrentSessionProfile();

      if (!isMounted) {
        return;
      }

      if (sessionState.status === "authenticated" && sessionState.role) {
        router.replace(getPostLoginRedirect(sessionState.role));
        return;
      }

      if (
        sessionState.isAuthenticated &&
        sessionState.status !== "unauthenticated"
      ) {
        await supabase.auth.signOut();
      }

      if (isMounted) {
        setIsResolvingSession(false);
      }
    }

    redirectExistingSession();

    return () => {
      isMounted = false;
    };
  }, [router, supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateLoginForm(email, password);
    setErrors(nextErrors);
    setFormError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setFormError(genericLoginError);
      setIsSubmitting(false);
      return;
    }

    const sessionState = await getCurrentSessionProfile();

    if (sessionState.status === "authenticated" && sessionState.role) {
      router.replace(getPostLoginRedirect(sessionState.role));
      return;
    }

    await supabase.auth.signOut();
    setFormError(genericLoginError);
    setIsSubmitting(false);
  }

  const isBusy = isResolvingSession || isSubmitting;

  if (isResolvingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          <span>Validando sesion...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 lg:grid-cols-2">
        <section className="flex flex-col justify-center gap-8 border-b border-border px-6 py-12 sm:px-10 lg:border-b-0 lg:border-r lg:px-14">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
              SentiQ Restaurantes
            </p>
            <div className="space-y-3">
              <h1 className="max-w-lg text-3xl font-semibold tracking-normal sm:text-4xl">
                Acceso para equipos de operacion
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground">
                Entra al panel administrativo para revisar feedback, atender
                alertas y dar seguimiento a la operacion del restaurante.
              </p>
            </div>
          </div>

          <div className="grid gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Roles permitidos</p>
              <p>platform_admin, restaurant_admin y manager.</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Accesos publicos</p>
              <p>
                Encuestas, dispositivos, privacidad y confirmaciones no usan
                esta pantalla.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="mb-6 space-y-2">
              <h2 className="text-2xl font-semibold tracking-normal">
                Iniciar sesion
              </h2>
              <p className="text-sm text-muted-foreground">
                Usa el correo y contrasena asignados a tu perfil.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Correo electronico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
                  disabled={isBusy}
                />
                {errors.email ? (
                  <p id="email-error" className="text-sm text-destructive">
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="password">
                  Contrasena
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
                  disabled={isBusy}
                />
                {errors.password ? (
                  <p id="password-error" className="text-sm text-destructive">
                    {errors.password}
                  </p>
                ) : null}
              </div>

              {formError ? (
                <div
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  role="alert"
                >
                  {formError}
                </div>
              ) : null}

              <Button className="h-10 w-full" type="submit" disabled={isBusy}>
                {isSubmitting ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                  <ArrowRight aria-hidden="true" />
                )}
                {isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-5 rounded-md border border-border bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
              La redireccion depende del rol: platform_admin entra a{" "}
              {ROUTES.PLATFORM_ADMIN_RESTAURANTS}; restaurant_admin y manager
              entran a {ROUTES.APP_DASHBOARD}.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
