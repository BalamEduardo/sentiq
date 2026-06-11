import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageContainerProps = HTMLAttributes<HTMLElement> & {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

export function PageContainer({
  title,
  description,
  actions,
  children,
  className,
  ...props
}: PageContainerProps) {
  return (
    <main
      className={cn(
        "mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    >
      {(title || description || actions) && (
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            {title && (
              <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
                {title}
              </h1>
            )}
            {description && (
              <p className="max-w-3xl text-sm leading-6 text-slate-600">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </main>
  );
}
