"use client";

import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type RatingScaleProps = {
  value?: number;
  onChange?: (value: number) => void;
  minLabel?: string;
  maxLabel?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
  "aria-label"?: string;
};

export function RatingScale({
  value,
  onChange,
  minLabel = "Muy malo",
  maxLabel = "Excelente",
  disabled,
  className,
  name,
  "aria-label": ariaLabel = "Selecciona una calificacion",
}: RatingScaleProps) {
  return (
    <fieldset className={cn("space-y-3", className)} disabled={disabled}>
      <legend className="sr-only">{ariaLabel}</legend>
      <div className="flex items-center justify-between gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <RatingButton
            key={rating}
            name={name}
            rating={rating}
            selected={value === rating}
            disabled={disabled}
            onClick={() => onChange?.(rating)}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs font-medium text-slate-500">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </fieldset>
  );
}

type RatingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  rating: number;
  selected: boolean;
  name?: string;
};

function RatingButton({
  rating,
  selected,
  name,
  className,
  ...props
}: RatingButtonProps) {
  return (
    <button
      type="button"
      name={name}
      aria-pressed={selected}
      className={cn(
        "flex size-10 items-center justify-center rounded-full border text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-teal-600/25 disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? "border-teal-700 bg-teal-700 text-white shadow-sm"
          : "border-slate-300 bg-white text-slate-700 hover:border-teal-600 hover:text-teal-700",
        className
      )}
      {...props}
    >
      {rating}
    </button>
  );
}
