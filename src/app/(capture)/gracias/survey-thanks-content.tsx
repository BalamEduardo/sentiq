"use client";

import { useSearchParams } from "next/navigation";

import { ThankYouMessage } from "@/components/feedback/thank-you-message";

function readMode(value: string | null): "qr" | "device" {
  return value === "device" ? "device" : "qr";
}

export function SurveyThanksContent() {
  const searchParams = useSearchParams();
  const mode = readMode(searchParams.get("mode"));

  return (
    <ThankYouMessage
      title="Gracias por compartir tu opinión."
      mode={mode}
      className="shadow-sm"
    />
  );
}
