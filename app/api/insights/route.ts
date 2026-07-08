import { NextResponse, type NextRequest } from "next/server";
import {
  getInsightReviewPageData,
  parseListInsightsQuery,
  resolveListInsightsStatus
} from "@/lib/insights";
import { handleApiError } from "@/lib/api-errors";
import { getRequestContext } from "@/lib/request-context";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const context = await getRequestContext(request);
    const query = parseListInsightsQuery(request.nextUrl.searchParams);
    const data = await getInsightReviewPageData(context, query);

    return NextResponse.json({
      data: data.insights,
      status: resolveListInsightsStatus(query),
      statusCounts: data.statusCounts
    });
  } catch (error) {
    return handleApiError(error);
  }
}
