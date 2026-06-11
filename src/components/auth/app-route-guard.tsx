"use client";

import type { ReactNode } from "react";

import { AuthGuard } from "./auth-guard";

type AppRouteGuardProps = {
  children: ReactNode;
};

export function AppRouteGuard({ children }: AppRouteGuardProps) {
  return <AuthGuard loadingTitle="Validando app">{children}</AuthGuard>;
}
