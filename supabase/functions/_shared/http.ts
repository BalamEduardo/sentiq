export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export type PublicErrorCode =
  | "invalid_method"
  | "invalid_payload"
  | "invalid_token"
  | "inactive_link"
  | "inactive_restaurant"
  | "inactive_branch"
  | "inactive_device"
  | "rate_limited"
  | "server_error";

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Connection": "keep-alive",
    },
  });
}

export function errorResponse(code: PublicErrorCode, status: number, message: string = code): Response {
  return jsonResponse({ ok: false, error: { code, message } }, status);
}

export async function readJsonBody(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

export function handleOptions(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  return null;
}
