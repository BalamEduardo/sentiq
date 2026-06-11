import type { Session, User } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserProfile, UserRole } from "@/types/domain";

import { isValidUserRole } from "./permissions";

export type AuthSessionStatus =
  | "authenticated"
  | "unauthenticated"
  | "profile_missing"
  | "profile_inactive"
  | "invalid_role"
  | "error";

export type AuthSessionProfile = UserProfile | null;

export type AuthSessionState = {
  session: Session | null;
  user: User | null;
  profile: AuthSessionProfile;
  role: UserRole | null;
  status: AuthSessionStatus;
  isAuthenticated: boolean;
  isActiveProfile: boolean;
};

const unauthenticatedState: AuthSessionState = {
  session: null,
  user: null,
  profile: null,
  role: null,
  status: "unauthenticated",
  isAuthenticated: false,
  isActiveProfile: false,
};

export async function getCurrentSessionProfile(): Promise<AuthSessionState> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      return { ...unauthenticatedState, status: "error" };
    }

    const session = sessionData.session;
    const user = session?.user ?? null;

    if (!session || !user) {
      return unauthenticatedState;
    }

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select(
        "id, restaurant_id, full_name, email, role, status, created_by, created_at, updated_at",
      )
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return {
        session,
        user,
        profile: null,
        role: null,
        status: "error",
        isAuthenticated: true,
        isActiveProfile: false,
      };
    }

    if (!profile) {
      return {
        session,
        user,
        profile: null,
        role: null,
        status: "profile_missing",
        isAuthenticated: true,
        isActiveProfile: false,
      };
    }

    if (!isValidUserRole(profile.role)) {
      return {
        session,
        user,
        profile,
        role: null,
        status: "invalid_role",
        isAuthenticated: true,
        isActiveProfile: false,
      };
    }

    const isActiveProfile = profile.status === "active";

    return {
      session,
      user,
      profile,
      role: profile.role,
      status: isActiveProfile ? "authenticated" : "profile_inactive",
      isAuthenticated: true,
      isActiveProfile,
    };
  } catch {
    return { ...unauthenticatedState, status: "error" };
  }
}
