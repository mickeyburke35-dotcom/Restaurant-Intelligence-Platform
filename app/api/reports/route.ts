import { NextResponse, type NextRequest } from "next/server";
import { handleApiError, readJsonRequest } from "@/lib/api-errors";
import {
  createApprovedInsightsReport,
  createReportRequestSchema,
  getReportInsightEligibility
} from "@/lib/reports";
import { getRequestContext } from "@/lib/request-context";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const context = await getRequestContext(request);
    const searchParams = request.nextUrl.searchParams;
    const query = createReportRequestSchema.parse({
      dateRangeEnd: searchParams.get("dateRangeEnd"),
      dateRangeStart: searchParams.get("dateRangeStart"),
      locationId: searchParams.get("locationId") ?? undefined,
      restaurantId: searchParams.get("restaurantId")
    });
    const data = await getReportInsightEligibility(context, query);

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await getRequestContext(request);
    const body = createReportRequestSchema.parse(await readJsonRequest(request));
    const data = await createApprovedInsightsReport(context, body);

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
