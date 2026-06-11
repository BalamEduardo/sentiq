import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const QR_LIMIT_PER_MINUTE = 5;
const DEVICE_LIMIT_PER_MINUTE = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_EXPIRATION_MS = 10 * 60 * 1000;
const HASH_ALGORITHM = "SHA-256";

type CaptureSource = "qr" | "device";

type ApplyRateLimitInput = {
  supabase: SupabaseClient;
  req: Request;
  surveyLinkId: string;
  source: CaptureSource;
};

type ApplyRateLimitResult =
  | { ok: true }
  | { ok: false; reason: "limited" | "configuration_error" | "server_error" };

export async function applyPublicRateLimit(input: ApplyRateLimitInput): Promise<ApplyRateLimitResult> {
  const now = new Date();
  const windowStart = floorToWindowStart(now);
  const expiresAt = new Date(windowStart.getTime() + RATE_LIMIT_EXPIRATION_MS);
  const limit = input.source === "qr" ? QR_LIMIT_PER_MINUTE : DEVICE_LIMIT_PER_MINUTE;

  const scopeKeyResult = await buildScopeKey({
    req: input.req,
    surveyLinkId: input.surveyLinkId,
    source: input.source,
  });

  if (!scopeKeyResult.ok) {
    return { ok: false, reason: "configuration_error" };
  }

  const { data, error } = await input.supabase.rpc("apply_public_rate_limit", {
    p_scope_key: scopeKeyResult.scopeKey,
    p_survey_link_id: input.surveyLinkId,
    p_source: input.source,
    p_window_start: windowStart.toISOString(),
    p_expires_at: expiresAt.toISOString(),
    p_limit: limit,
  });

  if (error) {
    return { ok: false, reason: "server_error" };
  }

  return data === true ? { ok: true } : { ok: false, reason: "limited" };
}

function floorToWindowStart(date: Date): Date {
  return new Date(Math.floor(date.getTime() / RATE_LIMIT_WINDOW_MS) * RATE_LIMIT_WINDOW_MS);
}

async function buildScopeKey(input: {
  req: Request;
  surveyLinkId: string;
  source: CaptureSource;
}): Promise<{ ok: true; scopeKey: string } | { ok: false }> {
  if (input.source === "device") {
    return {
      ok: true,
      scopeKey: await hashHex(`device:${input.surveyLinkId}`),
    };
  }

  const salt = Deno.env.get("RATE_LIMIT_SECRET_SALT")?.trim();

  if (!salt) {
    return { ok: false };
  }

  const clientIp = getClientIp(input.req);
  const ipHash = await hashHex(`${clientIp}:${salt}`);

  return {
    ok: true,
    scopeKey: await hashHex(`qr:${input.surveyLinkId}:${ipHash}`),
  };
}

function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const firstForwardedIp = forwardedFor?.split(",")[0]?.trim();

  return (
    req.headers.get("cf-connecting-ip")?.trim()
    || firstForwardedIp
    || req.headers.get("x-real-ip")?.trim()
    || "unknown"
  );
}

async function hashHex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(HASH_ALGORITHM, new TextEncoder().encode(value));

  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
