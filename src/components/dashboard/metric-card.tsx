import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MetricCardProps = {
  title: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  description?: ReactNode;
  trend?: ReactNode;
  className?: string;
};

export function MetricCard({
  title,
  value,
  icon,
  description,
  trend,
  className,
}: MetricCardProps) {
  return (
    <article
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        {icon && (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            {icon}
          </div>
        )}
      </div>
      {(description || trend) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          {trend && <span className="font-medium text-teal-700">{trend}</span>}
          {description && <span className="text-slate-500">{description}</span>}
        </div>
      )}
    </article>
  );
}
