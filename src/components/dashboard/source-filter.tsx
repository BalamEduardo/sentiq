"use client";

import { MonitorSmartphone, QrCode } from "lucide-react";

import { cn } from "@/lib/utils";

type SourceValue = "all" | "qr" | "device";

type SourceFilterProps = {
  value?: SourceValue;
  onChange?: (value: SourceValue) => void;
  className?: string;
};

const sourceOptions = [
  { label: "Todos", value: "all" as const, icon: MonitorSmartphone },
  { label: "QR", value: "qr" as const, icon: QrCode },
  { label: "Dispositivo", value: "device" as const, icon: MonitorSmartphone },
];

export function SourceFilter({ value = "all", onChange, className }: SourceFilterProps) {
  return (
    <fieldset className={cn("space-y-2", className)}>
      <legend className="text-sm font-medium text-slate-700">Origen</legend>
      <div className="flex flex-wrap gap-2">
        {sourceOptions.map(({ label, value: optionValue, icon: Icon }) => {
          const selected = value === optionValue;

          return (
            <button
              key={optionValue}
              type="button"
              aria-pressed={selected}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-teal-600/20",
                selected
                  ? "border-teal-700 bg-teal-50 text-teal-800"
                  : "border-slate-300 bg-white text-slate-700 hover:border-teal-600"
              )}
              onClick={() => onChange?.(optionValue)}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
