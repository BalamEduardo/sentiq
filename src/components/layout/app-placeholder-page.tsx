import type { ReactNode } from "react";

type AppPlaceholderPageProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function AppPlaceholderPage({
  title,
  description,
  children,
}: AppPlaceholderPageProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-normal text-slate-500">
          Proximo ticket
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}
