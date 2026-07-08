import { NextResponse, type NextRequest } from "next/server";
import {
  listCompetitors,
  parseListCompetitorsQuery
} from "@/lib/competitors";
import { handleApiError } from "@/lib/api-errors";
import { getRequestContext } from "@/lib/request-context";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const context = await getRequestContext(request);
    const query = parseListCompetitorsQuery(request.nextUrl.searchParams);
    const data = await listCompetitors(context, query);

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
