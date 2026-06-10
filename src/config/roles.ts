export const ROLES = {
  PLATFORM_ADMIN: "platform_admin",
  RESTAURANT_ADMIN: "restaurant_admin",
  MANAGER: "manager",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
