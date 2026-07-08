import type { NextRequest } from "next/server";

export function getSafeRedirectPath(value: string | null | undefined, fallback = "/workspace") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  if (value.startsWith("/sign-in")) {
    return fallback;
  }

  return value;
}

export function isSameOriginRequest(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }

  return origin === request.nextUrl.origin;
}
