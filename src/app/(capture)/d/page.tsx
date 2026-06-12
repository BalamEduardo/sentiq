import { Suspense } from "react";

import { DeviceSurveySearchParams } from "../capture-survey-search-params";

export default function DeviceSurveyPage() {
  return (
    <Suspense fallback={null}>
      <DeviceSurveySearchParams />
    </Suspense>
  );
}
