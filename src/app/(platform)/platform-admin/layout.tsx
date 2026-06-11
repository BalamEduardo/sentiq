import type { ReactNode } from "react";

import { PlatformRouteGuard } from "@/components/auth";

type PlatformAdminLayoutProps = {
  children: ReactNode;
};

export default function PlatformAdminLayout({
  children,
}: PlatformAdminLayoutProps) {
  return <PlatformRouteGuard>{children}</PlatformRouteGuard>;
}
