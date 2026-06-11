"use client";

import type { ReactNode } from "react";

import { AuthGuard } from "./auth-guard";

type PlatformRouteGuardProps = {
  children: ReactNode;
};

export function PlatformRouteGuard({ children }: PlatformRouteGuardProps) {
  return (
    <AuthGuard loadingTitle="Validando administracion">{children}</AuthGuard>
  );
}
