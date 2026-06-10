type PublicEnvKey =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  | "NEXT_PUBLIC_APP_URL";

export type PublicEnv = Record<PublicEnvKey, string>;

const publicEnvKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_APP_URL",
] satisfies PublicEnvKey[];

export class PublicEnvError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PublicEnvError";
  }
}

function readPublicEnvValue(key: PublicEnvKey): string {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new PublicEnvError(`Missing required public environment variable: ${key}`);
  }

  return value;
}

function validateUrl(key: PublicEnvKey, value: string): string {
  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    throw new PublicEnvError(`Invalid URL in public environment variable: ${key}`);
  }
}

export function getPublicEnv(): PublicEnv {
  for (const key of publicEnvKeys) {
    readPublicEnvValue(key);
  }

  const env = {
    NEXT_PUBLIC_SUPABASE_URL: readPublicEnvValue("NEXT_PUBLIC_SUPABASE_URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: readPublicEnvValue(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ),
    NEXT_PUBLIC_APP_URL: readPublicEnvValue("NEXT_PUBLIC_APP_URL"),
  };

  return {
    ...env,
    NEXT_PUBLIC_SUPABASE_URL: validateUrl(
      "NEXT_PUBLIC_SUPABASE_URL",
      env.NEXT_PUBLIC_SUPABASE_URL,
    ),
    NEXT_PUBLIC_APP_URL: validateUrl(
      "NEXT_PUBLIC_APP_URL",
      env.NEXT_PUBLIC_APP_URL,
    ),
  };
}
