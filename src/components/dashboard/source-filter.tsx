"use client";

import { MonitorSmartphone, QrCode } from "lucide-react";

import { cn } from "@/lib/utils";

type SourceValue = "qr" | "device";

type SourceFilterProps = {
  value?: SourceValue[];
  onChange?: (value: SourceValue[]) => void;
  className?: string;
};

const sourceOptions = [
  { label: "QR", value: "qr" as const, icon: QrCode },
  { label: "Dispositivo", value: "device" as const, icon: MonitorSmartphone },
];

export function SourceFilter({ value = [], onChange, className }: SourceFilterProps) {
  function toggle(source: SourceValue) {
    const next = value.includes(source)
      ? value.filter((item) => item !== source)
      : [...value, source];
    onChange?.(next);
  }

  return (
    <fieldset className={cn("space-y-2", className)}>
      <legend className="text-sm font-medium text-slate-700">Origen</legend>
      <div className="flex flex-wrap gap-2">
        {sourceOptions.map(({ label, value: optionValue, icon: Icon }) => {
          const selected = value.includes(optionValue);

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
              onClick={() => toggle(optionValue)}
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
