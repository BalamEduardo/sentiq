import type { UserRole } from "@/types/domain";

export type BranchScopedProfile = {
  id: string;
  role: UserRole;
  restaurant_id: string | null;
};

export function canAccessPlatformAdmin(role: UserRole): boolean {
  return role === "platform_admin";
}

export function canAccessRestaurantApp(role: UserRole): boolean {
  return role === "restaurant_admin" || role === "manager";
}

export function canManageRestaurant(role: UserRole): boolean {
  return role === "restaurant_admin";
}

export function canManageUsers(role: UserRole): boolean {
  return role === "restaurant_admin";
}

export function canViewPhone(role: UserRole): boolean {
  return role === "restaurant_admin" || role === "manager";
}

export function canExportFeedback(role: UserRole): boolean {
  return role === "restaurant_admin" || role === "manager";
}

export function canManageAlert(role: UserRole): boolean {
  return role === "restaurant_admin" || role === "manager";
}

export function canUseBranchScope(role: UserRole): boolean {
  return role === "manager";
}
