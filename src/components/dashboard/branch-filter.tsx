import { Store } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BranchFilterProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  branches?: Array<{ label: string; value: string }>;
};

export function BranchFilter({
  label = "Sucursal",
  branches = [{ label: "Todas las sucursales", value: "all" }],
  className,
  id = "branch-filter",
  ...props
}: BranchFilterProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <Store className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
        <select
          id={id}
          className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-9 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-teal-600/20"
          {...props}
        >
          {branches.map((branch) => (
            <option key={branch.value} value={branch.value}>
              {branch.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
          ▾
        </span>
      </div>
    </div>
  );
}
