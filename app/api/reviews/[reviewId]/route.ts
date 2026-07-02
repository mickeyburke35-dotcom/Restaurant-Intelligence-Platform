import { NextResponse, type NextRequest } from "next/server";
import { handleApiError } from "@/lib/api-errors";
import { getRequestContext } from "@/lib/request-context";
import { getReviewDetail, reviewRouteParamsSchema } from "@/lib/reviews";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    reviewId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const context = await getRequestContext(request);
    const { reviewId } = reviewRouteParamsSchema.parse(await params);
    const data = await getReviewDetail(context, reviewId);

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
