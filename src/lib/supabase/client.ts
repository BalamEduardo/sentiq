import { createClient } from "@supabase/supabase-js";

import { getPublicEnv } from "@/config/env";
import type { Database } from "@/types/supabase";

type SupabaseBrowserClient = ReturnType<typeof createClient<Database>>;

let browserClient: SupabaseBrowserClient | undefined;

export function getSupabaseBrowserClient(): SupabaseBrowserClient {
  if (browserClient) {
    return browserClient;
  }

  const env = getPublicEnv();

  browserClient = createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    },
  );

  return browserClient;
}
