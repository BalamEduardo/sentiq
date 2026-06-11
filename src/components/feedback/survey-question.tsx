"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { RatingScale } from "./rating-scale";

type SurveyQuestionProps = {
  number?: number;
  title: ReactNode;
  description?: ReactNode;
  required?: boolean;
  value?: number;
  onChange?: (value: number) => void;
  children?: ReactNode;
  className?: string;
};

export function SurveyQuestion({
  number,
  title,
  description,
  required,
  value,
  onChange,
  children,
  className,
}: SurveyQuestionProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-4 shadow-sm",
        className
      )}
    >
      <div className="mb-5 flex items-start gap-3">
        {number !== undefined && (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-semibold text-white">
            {number}
          </span>
        )}
        <div className="min-w-0 space-y-1">
          <h2 className="text-base font-semibold leading-6 text-slate-950">
            {title}
            {required && <span className="ml-1 text-orange-600">*</span>}
          </h2>
          {description && <p className="text-sm leading-5 text-slate-600">{description}</p>}
        </div>
      </div>
      {children ?? <RatingScale value={value} onChange={onChange} />}
    </section>
  );
}
