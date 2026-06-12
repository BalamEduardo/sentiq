import { Suspense } from "react";

import { BranchSurveySearchParams } from "../capture-survey-search-params";

export default function BranchSurveyPage() {
  return (
    <Suspense fallback={null}>
      <BranchSurveySearchParams />
    </Suspense>
  );
}
