import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

type RestaurantAppLayoutProps = {
  children: ReactNode;
};

export default function RestaurantAppLayout({
  children,
}: RestaurantAppLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
