"use client";

import { useId, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type RatingScaleProps = {
  value?: number;
  onChange?: (value: number) => void;
  minLabel?: string;
  maxLabel?: string;
  disabled?: boolean;
  error?: string;
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
  error,
  className,
  name,
  "aria-label": ariaLabel = "Selecciona una calificacion",
}: RatingScaleProps) {
  const generatedId = useId();
  const errorId = `${name ?? generatedId}-error`;

  return (
    <fieldset
      className={cn("space-y-3", className)}
      disabled={disabled}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? errorId : undefined}
    >
      <legend className="sr-only">{ariaLabel}</legend>
      <div className="flex items-center justify-between gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <RatingButton
            key={rating}
            name={name}
            rating={rating}
            selected={value === rating}
            invalid={Boolean(error)}
            disabled={disabled}
            onClick={() => onChange?.(rating)}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs font-medium text-slate-500">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
      {error && (
        <p id={errorId} className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}

type RatingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  rating: number;
  selected: boolean;
  invalid: boolean;
  name?: string;
};

function RatingButton({
  rating,
  selected,
  invalid,
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
        invalid && !selected && "border-red-300 text-red-700 hover:border-red-400",
        className
      )}
      {...props}
    >
      {rating}
    </button>
  );
}
