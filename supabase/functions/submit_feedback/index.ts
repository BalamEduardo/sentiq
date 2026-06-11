import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createServiceClient } from "../_shared/supabase-admin.ts";
import { errorResponse, handleOptions, jsonResponse, readJsonBody } from "../_shared/http.ts";
import { getSurveyLinkContext } from "../_shared/survey-link.ts";

type RequestPayload = {
  token?: unknown;
  source?: unknown;
  general_experience?: unknown;
  service_attention?: unknown;
  food_quality?: unknown;
  service_speed?: unknown;
  comment?: unknown;
  customer_phone?: unknown;
  consent_to_contact?: unknown;
};

const QR_LIMIT_PER_MINUTE = 5;
const DEVICE_LIMIT_PER_MINUTE = 10;
const COMMENT_MAX_LENGTH = 1000;
const PHONE_MAX_LENGTH = 30;

Deno.serve(async (req: Request) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  if (req.method !== "POST") {
    return errorResponse("invalid_method", 405);
  }

  const body = (await readJsonBody(req)) as RequestPayload | null;
  const validation = validatePayload(body);

  if (!validation.ok) {
    return errorResponse("invalid_payload", 400, validation.errors.join(","));
  }

  try {
    const supabase = createServiceClient();
    const linkResult = await getSurveyLinkContext(supabase, validation.value.token);

    if (!linkResult.ok) {
      return errorResponse(linkResult.code, linkResult.code === "invalid_token" ? 404 : 403);
    }

    const { context } = linkResult;

    if (validation.value.source !== context.type) {
      return errorResponse("invalid_payload", 400, "source_mismatch");
    }

    const rateLimitResult = await applyRateLimit({
      supabase,
      req,
      surveyLinkId: context.id,
      source: context.type,
    });

    if (!rateLimitResult.ok) {
      return errorResponse("rate_limited", 429);
    }

    const hasAlert = validation.value.general_experience <= 3;
    const consentTextSnapshot = validation.value.customer_phone
      ? context.settings?.contact_consent_text ?? "Acepto que el restaurante me contacte para dar seguimiento a mi experiencia."
      : null;

    const { data: response, error: insertError } = await supabase
      .from("feedback_responses")
      .insert({
        restaurant_id: context.restaurant_id,
        branch_id: context.branch_id,
        zone_id: context.zone_id,
        device_id: context.device_id,
        survey_link_id: context.id,
        source: context.type,
        general_experience: validation.value.general_experience,
        service_attention: validation.value.service_attention,
        food_quality: validation.value.food_quality,
        service_speed: validation.value.service_speed,
        comment: validation.value.comment,
        customer_phone: validation.value.customer_phone,
        consent_to_contact: validation.value.consent_to_contact,
        consent_text_snapshot: consentTextSnapshot,
        has_alert: hasAlert,
      })
      .select("id")
      .single();

    if (insertError || !response) {
      return errorResponse("server_error", 500);
    }

    if (hasAlert) {
      const { error: alertError } = await supabase.from("feedback_alerts").insert({
        restaurant_id: context.restaurant_id,
        branch_id: context.branch_id,
        zone_id: context.zone_id,
        device_id: context.device_id,
        response_id: response.id,
        source: context.type,
        general_experience: validation.value.general_experience,
        status: "pending",
      });

      if (alertError) {
        return errorResponse("server_error", 500);
      }
    }

    await supabase.from("survey_links").update({ last_used_at: new Date().toISOString() }).eq("id", context.id);

    if (context.type === "device" && context.device_id) {
      await supabase.from("devices").update({ last_used_at: new Date().toISOString() }).eq("id", context.device_id);
    }

    return jsonResponse({ ok: true, response_id: response.id, has_alert: hasAlert });
  } catch {
    return errorResponse("server_error", 500);
  }
});

function validatePayload(body: RequestPayload | null):
  | {
      ok: true;
      value: {
        token: string;
        source: "qr" | "device";
        general_experience: number;
        service_attention: number;
        food_quality: number;
        service_speed: number;
        comment: string | null;
        customer_phone: string | null;
        consent_to_contact: boolean;
      };
    }
  | { ok: false; errors: string[] } {
  const errors: string[] = [];

  const token = typeof body?.token === "string" ? body.token.trim() : "";
  if (!token) errors.push("token_required");

  const source = body?.source === "qr" || body?.source === "device" ? body.source : null;
  if (!source) errors.push("invalid_source");

  const generalExperience = normalizeRating(body?.general_experience);
  const serviceAttention = normalizeRating(body?.service_attention);
  const foodQuality = normalizeRating(body?.food_quality);
  const serviceSpeed = normalizeRating(body?.service_speed);

  if (!generalExperience) errors.push("invalid_general_experience");
  if (!serviceAttention) errors.push("invalid_service_attention");
  if (!foodQuality) errors.push("invalid_food_quality");
  if (!serviceSpeed) errors.push("invalid_service_speed");

  const comment = typeof body?.comment === "string" && body.comment.trim().length > 0 ? body.comment.trim() : null;
  if (comment && comment.length > COMMENT_MAX_LENGTH) errors.push("comment_too_long");

  const customerPhone = typeof body?.customer_phone === "string" && body.customer_phone.trim().length > 0
    ? body.customer_phone.trim()
    : null;
  if (customerPhone && customerPhone.length > PHONE_MAX_LENGTH) errors.push("phone_too_long");

  const consentToContact = body?.consent_to_contact === true;
  if (customerPhone && !consentToContact) errors.push("customer_phone_requires_consent");

  if (errors.length > 0 || !source || !generalExperience || !serviceAttention || !foodQuality || !serviceSpeed) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      token,
      source,
      general_experience: generalExperience,
      service_attention: serviceAttention,
      food_quality: foodQuality,
      service_speed: serviceSpeed,
      comment,
      customer_phone: customerPhone,
      consent_to_contact: consentToContact,
    },
  };
}

function normalizeRating(value: unknown): number | null {
  return Number.isInteger(value) && typeof value === "number" && value >= 1 && value <= 5 ? value : null;
}

async function applyRateLimit(input: {
  supabase: ReturnType<typeof createServiceClient>;
  req: Request;
  surveyLinkId: string;
  source: "qr" | "device";
}): Promise<{ ok: true } | { ok: false }> {
  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setSeconds(0, 0);
  const expiresAt = new Date(windowStart.getTime() + 10 * 60 * 1000);

  const scopeKey = await buildScopeKey(input.req, input.surveyLinkId, input.source);

  const { data: existingCounter } = await input.supabase
    .from("rate_limit_counters")
    .select("id,request_count")
    .eq("scope_key", scopeKey)
    .eq("window_start", windowStart.toISOString())
    .maybeSingle();

  const limit = input.source === "qr" ? QR_LIMIT_PER_MINUTE : DEVICE_LIMIT_PER_MINUTE;

  if (existingCounter) {
    if (existingCounter.request_count >= limit) {
      return { ok: false };
    }

    await input.supabase
      .from("rate_limit_counters")
      .update({ request_count: existingCounter.request_count + 1, updated_at: now.toISOString() })
      .eq("id", existingCounter.id);

    return { ok: true };
  }

  await input.supabase.from("rate_limit_counters").insert({
    scope_key: scopeKey,
    survey_link_id: input.surveyLinkId,
    source: input.source,
    window_start: windowStart.toISOString(),
    request_count: 1,
    expires_at: expiresAt.toISOString(),
  });

  return { ok: true };
}

async function buildScopeKey(req: Request, surveyLinkId: string, source: "qr" | "device"): Promise<string> {
  const forwardedFor = req.headers.get("x-forwarded-for") ?? "unknown";
  const clientIp = forwardedFor.split(",")[0]?.trim() || "unknown";
  const salt = Deno.env.get("RATE_LIMIT_SECRET_SALT") ?? "development-rate-limit-salt";
  const rawScope = source === "qr" ? `qr:${surveyLinkId}:${clientIp}:${salt}` : `device:${surveyLinkId}:${salt}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawScope));

  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
