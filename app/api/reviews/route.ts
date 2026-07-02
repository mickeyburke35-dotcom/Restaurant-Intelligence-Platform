import { NextResponse, type NextRequest } from "next/server";
import {
  listReviewFilterOptions,
  listReviews,
  parseListReviewsQuery
} from "@/lib/reviews";
import { handleApiError } from "@/lib/api-errors";
import { getRequestContext } from "@/lib/request-context";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const context = await getRequestContext(request);
    const query = parseListReviewsQuery(request.nextUrl.searchParams);
    const [reviews, filters] = await Promise.all([
      listReviews(context, query),
      listReviewFilterOptions(context)
    ]);

    return NextResponse.json({
      ...reviews,
      filters
    });
  } catch (error) {
    return handleApiError(error);
  }
}
