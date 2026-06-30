import type { MembershipRole } from "@prisma/client";

export const AUTH_COOKIE_NAME = "rip_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

const SESSION_VERSION = 1;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export type AuthSessionPayload = {
  version: typeof SESSION_VERSION;
  userId: string;
  email: string;
  name: string | null;
  agencyId: string;
  agencyName: string;
  agencySlug: string;
  membershipId: string;
  role: MembershipRole;
  restaurantId: string | null;
  issuedAt: number;
  expiresAt: number;
};

export type CreateSessionInput = Omit<
  AuthSessionPayload,
  "version" | "issuedAt" | "expiresAt"
>;

export function getSessionCookieOptions(maxAge = SESSION_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge
  };
}

export async function createSessionToken(input: CreateSessionInput) {
  const now = Math.floor(Date.now() / 1000);
  const payload: AuthSessionPayload = {
    ...input,
    version: SESSION_VERSION,
    issuedAt: now,
    expiresAt: now + SESSION_MAX_AGE_SECONDS
  };
  const encodedPayload = base64UrlEncodeText(JSON.stringify(payload));
  const signature = await sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature, extra] = token.split(".");
  if (!encodedPayload || !signature || extra !== undefined) {
    return null;
  }

  const expectedSignature = await sign(encodedPayload);
  if (!constantTimeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecodeText(encodedPayload));

    if (!isSessionPayload(payload)) {
      return null;
    }

    if (payload.expiresAt <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

async function sign(value: string) {
  const secret = getSessionSecret();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

  return bytesToBase64Url(new Uint8Array(signature));
}

function getSessionSecret() {
  const configuredSecret = process.env.AUTH_SESSION_SECRET;
  if (configuredSecret && configuredSecret.length >= 32) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "development-only-restaurant-intelligence-session-secret";
  }

  throw new Error("AUTH_SESSION_SECRET must be set to at least 32 characters.");
}

function isSessionPayload(value: unknown): value is AuthSessionPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<AuthSessionPayload>;

  return (
    payload.version === SESSION_VERSION &&
    typeof payload.userId === "string" &&
    typeof payload.email === "string" &&
    (typeof payload.name === "string" || payload.name === null) &&
    typeof payload.agencyId === "string" &&
    typeof payload.agencyName === "string" &&
    typeof payload.agencySlug === "string" &&
    typeof payload.membershipId === "string" &&
    typeof payload.role === "string" &&
    (typeof payload.restaurantId === "string" || payload.restaurantId === null) &&
    typeof payload.issuedAt === "number" &&
    typeof payload.expiresAt === "number"
  );
}

function base64UrlEncodeText(value: string) {
  return bytesToBase64Url(encoder.encode(value));
}

function base64UrlDecodeText(value: string) {
  return decoder.decode(base64UrlToBytes(value));
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(paddedBase64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return result === 0;
}
