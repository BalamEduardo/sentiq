import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MetricCardProps = {
  title: ReactNode;
  value?: ReactNode;
  icon?: ReactNode;
  description?: ReactNode;
  trend?: ReactNode;
  loading?: boolean;
  className?: string;
};

export function MetricCard({
  title,
  value,
  icon,
  description,
  trend,
  loading,
  className,
}: MetricCardProps) {
  return (
    <article
      aria-busy={loading}
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          {loading ? (
            <div className="mt-3 h-9 w-24 animate-pulse rounded-md bg-slate-200" />
          ) : (
            <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
          )}
        </div>
        {icon && (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            {icon}
          </div>
        )}
      </div>
      {(description || trend) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          {loading ? (
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          ) : (
            <>
              {trend && <span className="font-medium text-teal-700">{trend}</span>}
              {description && <span className="text-slate-500">{description}</span>}
            </>
          )}
        </div>
      )}
    </article>
  );
}
