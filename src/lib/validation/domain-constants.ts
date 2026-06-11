import type {
  AccountStatus,
  AlertStatus,
  BranchStatus,
  DeviceStatus,
  FeedbackSource,
  PlanCode,
  ProfileStatus,
  RatingValue,
  RestaurantStatus,
  SurveyLinkStatus,
  SurveyLinkType,
  UserRole,
  WaiterStatus,
  ZoneStatus,
} from "@/types/domain";

export const USER_ROLES = ["platform_admin", "restaurant_admin", "manager"] as const satisfies readonly UserRole[];
export const PROFILE_STATUSES = ["active", "invited", "inactive"] as const satisfies readonly ProfileStatus[];
export const RESTAURANT_STATUSES = ["active", "inactive", "suspended"] as const satisfies readonly RestaurantStatus[];
export const BRANCH_STATUSES = ["active", "inactive"] as const satisfies readonly BranchStatus[];
export const ZONE_STATUSES = ["active", "inactive"] as const satisfies readonly ZoneStatus[];
export const WAITER_STATUSES = ["active", "inactive"] as const satisfies readonly WaiterStatus[];
export const DEVICE_STATUSES = ["active", "inactive", "lost", "revoked"] as const satisfies readonly DeviceStatus[];
export const SURVEY_LINK_TYPES = ["qr", "device"] as const satisfies readonly SurveyLinkType[];
export const SURVEY_LINK_STATUSES = ["active", "inactive", "revoked"] as const satisfies readonly SurveyLinkStatus[];
export const FEEDBACK_SOURCES = ["qr", "device"] as const satisfies readonly FeedbackSource[];
export const ALERT_STATUSES = ["pending", "attended"] as const satisfies readonly AlertStatus[];
export const PLAN_CODES = ["demo", "basico", "pro", "custom"] as const satisfies readonly PlanCode[];
export const ACCOUNT_STATUSES = ["demo", "pilot", "active", "paused", "cancelled"] as const satisfies readonly AccountStatus[];

export function isRatingValue(value: unknown): value is RatingValue {
  return Number.isInteger(value) && typeof value === "number" && value >= 1 && value <= 5;
}

export function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}
