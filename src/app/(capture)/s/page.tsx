"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { PublicQrSurvey } from "@/features/capture/components/public-qr-survey";

export default function BranchSurveyPage() {
  return (
    <Suspense fallback={null}>
      <BranchSurveyPageContent />
    </Suspense>
  );
}

function BranchSurveyPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return <PublicQrSurvey token={token} />;
}
