import { Shield, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

type RoleVariant = "platform_admin" | "admin" | "manager" | "staff";

type RoleBadgeProps = {
  role: RoleVariant;
  label?: string;
  className?: string;
};

const roleLabels: Record<RoleVariant, string> = {
  platform_admin: "Platform admin",
  admin: "Administrador",
  manager: "Gerente",
  staff: "Staff",
};

export function RoleBadge({ role, label = roleLabels[role], className }: RoleBadgeProps) {
  const Icon = role === "manager" || role === "staff" ? UserRound : Shield;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 ring-1 ring-teal-100",
        role === "platform_admin" && "bg-slate-900 text-white ring-slate-900",
        role === "staff" && "bg-slate-100 text-slate-700 ring-slate-200",
        className
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
