import { Suspense } from "react";

import { ThankYouMessage } from "@/components/feedback/thank-you-message";

import { SurveyThanksContent } from "./survey-thanks-content";

export default function SurveyThanksPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950">
      <Suspense
        fallback={
          <ThankYouMessage
            title="Gracias por compartir tu opinión."
            className="shadow-sm"
          />
        }
      >
        <SurveyThanksContent />
      </Suspense>
    </main>
  );
}
