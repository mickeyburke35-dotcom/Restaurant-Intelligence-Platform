import { NextResponse, type NextRequest } from "next/server";
import { getSafeRedirectPath, isSameOriginRequest } from "@/lib/auth/request";
import {
  AUTH_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions
} from "@/lib/auth/session";
import { resolveActiveMembershipForSignIn, recordUserSignIn } from "@/lib/auth/membership";
import { normalizeAgencySlug, signInSchema } from "@/lib/auth/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }

  const input = await parseSignInRequest(request).catch(() => null);
  const parsed = signInSchema.safeParse(input);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the form." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const agencySlug = normalizeAgencySlug(parsed.data.agencySlug);

  try {
    const membership = await resolveActiveMembershipForSignIn(email, agencySlug);

    if (!membership) {
      return NextResponse.json(
        { error: "No active agency membership was found for those details." },
        { status: 401 }
      );
    }

    await recordUserSignIn(membership.userId);

    const token = await createSessionToken({
      userId: membership.user.id,
      email: membership.user.email,
      name: membership.user.name,
      agencyId: membership.agency.id,
      agencyName: membership.agency.name,
      agencySlug: membership.agency.slug,
      membershipId: membership.id,
      role: membership.role,
      restaurantId: membership.restaurantId
    });
    const redirectTo = getSafeRedirectPath(parsed.data.next);
    const response = NextResponse.json({ redirectTo });
    response.cookies.set(AUTH_COOKIE_NAME, token, getSessionCookieOptions());

    return response;
  } catch (error) {
    console.error("Sign-in failed.", error);

    return NextResponse.json({ error: "We could not sign you in." }, { status: 500 });
  }
}

async function parseSignInRequest(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return request.json();
  }

  const formData = await request.formData();

  return Object.fromEntries(formData.entries());
}
