"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoadingState } from "@/components/shared";
import { ROUTES } from "@/config/routes";

export default function RestaurantAppPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.APP_DASHBOARD);
  }, [router]);

  return (
    <LoadingState
      title="Redirigiendo"
      description="Te estamos llevando al dashboard del restaurante."
      className="min-h-96 shadow-none"
    />
  );
}
