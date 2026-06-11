import type { ReactNode } from "react";

import { AppRouteGuard } from "@/components/auth";

type RestaurantAppLayoutProps = {
  children: ReactNode;
};

export default function RestaurantAppLayout({
  children,
}: RestaurantAppLayoutProps) {
  return <AppRouteGuard>{children}</AppRouteGuard>;
}
