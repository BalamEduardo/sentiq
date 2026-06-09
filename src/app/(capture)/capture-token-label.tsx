"use client";

import { useSearchParams } from "next/navigation";

export function CaptureTokenLabel() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return null;
  }

  return <p className="text-sm text-muted-foreground">Token: {token}</p>;
}
