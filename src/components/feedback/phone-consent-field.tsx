"use client";

import { Phone } from "lucide-react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type PhoneConsentFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  helperText?: string;
  error?: string;
};

export function PhoneConsentField({
  label = "Telefono para seguimiento",
  helperText = "Usaremos este numero solo para dar seguimiento a tu comentario.",
  error,
  id = "phone-consent",
  className,
  ...props
}: PhoneConsentFieldProps) {
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-slate-800">
        {label}
      </label>
      <div className="relative">
        <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
        <input
          id={id}
          type="tel"
          inputMode="tel"
          aria-describedby={error ? errorId : descriptionId}
          aria-invalid={Boolean(error)}
          className={cn(
            "h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-teal-600/20",
            error && "border-red-400 focus-visible:ring-red-500/20"
          )}
          placeholder="Ej. 55 1234 5678"
          {...props}
        />
      </div>
      {error ? (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      ) : (
        <p id={descriptionId} className="text-sm text-slate-500">
          {helperText}
        </p>
      )}
    </div>
  );
}
