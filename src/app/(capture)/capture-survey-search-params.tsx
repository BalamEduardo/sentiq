"use client";

import { useSearchParams } from "next/navigation";

import { PublicDeviceSurvey } from "@/features/capture/components/public-device-survey";
import { PublicQrSurvey } from "@/features/capture/components/public-qr-survey";

export function BranchSurveySearchParams() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return <PublicQrSurvey token={token} />;
}

export function DeviceSurveySearchParams() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return <PublicDeviceSurvey token={token} />;
}
