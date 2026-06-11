const PUBLIC_TOKEN_BYTE_LENGTH = 32;
const TOKEN_LAST4_LENGTH = 4;
const TOKEN_HASH_ALGORITHM = "SHA-256";

export type PublicTokenSecret = {
  token: string;
  tokenHash: string;
  tokenLast4: string;
};

export function generatePublicToken(): string {
  const randomBytes = new Uint8Array(PUBLIC_TOKEN_BYTE_LENGTH);
  crypto.getRandomValues(randomBytes);

  return encodeBase64Url(randomBytes);
}

export async function hashPublicToken(token: string): Promise<string> {
  const normalizedToken = normalizePublicToken(token);
  const encodedToken = new TextEncoder().encode(normalizedToken);
  const digest = await crypto.subtle.digest(TOKEN_HASH_ALGORITHM, encodedToken);

  return encodeHex(new Uint8Array(digest));
}

export function getPublicTokenLast4(token: string): string {
  const normalizedToken = normalizePublicToken(token);

  return normalizedToken.slice(-TOKEN_LAST4_LENGTH);
}

export async function createPublicTokenSecret(): Promise<PublicTokenSecret> {
  const token = generatePublicToken();

  return {
    token,
    tokenHash: await hashPublicToken(token),
    tokenLast4: getPublicTokenLast4(token),
  };
}

export function normalizePublicToken(token: string): string {
  const normalizedToken = token.trim();

  if (normalizedToken.length === 0) {
    throw new Error("Public token cannot be empty.");
  }

  return normalizedToken;
}

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function encodeHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
