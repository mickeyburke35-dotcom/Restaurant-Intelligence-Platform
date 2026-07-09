import { NextResponse, type NextRequest } from "next/server";
import { getSafeRedirectPath, isSameOriginRequest } from "@/lib/auth/request";
import { AUTH_COOKIE_NAME, getSessionCookieOptions } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }

  const redirectTo = getSafeRedirectPath(request.nextUrl.searchParams.get("next"), "/sign-in");
  const response = NextResponse.json({ redirectTo });
  response.cookies.set(AUTH_COOKIE_NAME, "", getSessionCookieOptions(0));

  return response;
}
