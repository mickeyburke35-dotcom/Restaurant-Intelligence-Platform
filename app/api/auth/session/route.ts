import { NextResponse } from "next/server";
import { getActiveAuthContext } from "@/lib/auth/context";

export const runtime = "nodejs";

export async function GET() {
  try {
    const context = await getActiveAuthContext();

    if (!context) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: context.user,
      agency: context.agency,
      membership: context.membership
    });
  } catch (error) {
    console.error("Session resolution failed.", error);

    return NextResponse.json(
      { authenticated: false, error: "We could not load the current session." },
      { status: 500 }
    );
  }
}
