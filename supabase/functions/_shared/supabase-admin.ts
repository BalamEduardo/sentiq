import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

export function createServiceClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serverKey = Deno.env.get("SUPABASE_" + "SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serverKey) {
    throw new Error("Missing Supabase server environment variables.");
  }

  return createClient(supabaseUrl, serverKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
