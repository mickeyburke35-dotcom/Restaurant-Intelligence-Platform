import { NextResponse, type NextRequest } from "next/server";
import { getSafeRedirectPath } from "@/lib/auth/request";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

const PROTECTED_PREFIXES = ["/workspace"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (isProtectedPath(pathname) && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.search = "";
    url.searchParams.set("next", getSafeRedirectPath(`${pathname}${request.nextUrl.search}`));

    return NextResponse.redirect(url);
  }

  if (pathname === "/sign-in" && session) {
    const url = new URL(getSafeRedirectPath(request.nextUrl.searchParams.get("next")), request.url);

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export const config = {
  matcher: ["/workspace/:path*", "/sign-in"]
};
