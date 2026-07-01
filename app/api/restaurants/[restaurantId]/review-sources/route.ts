import { NextResponse, type NextRequest } from "next/server";
import {
  createReviewSource,
  createReviewSourceSchema,
  listReviewSources,
  parseListReviewSourcesQuery,
  restaurantReviewSourceRouteParamsSchema
} from "@/lib/review-sources";
import { handleApiError, readJsonRequest } from "@/lib/api-errors";
import {
  assertCanManageReviewSources,
  getRequestContext
} from "@/lib/request-context";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    restaurantId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const context = await getRequestContext(request);
    const { restaurantId } = restaurantReviewSourceRouteParamsSchema.parse(await params);
    const query = parseListReviewSourcesQuery(request.nextUrl.searchParams);
    const data = await listReviewSources(context, {
      restaurantId,
      ...query
    });

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const context = await getRequestContext(request);
    assertCanManageReviewSources(context);

    const { restaurantId } = restaurantReviewSourceRouteParamsSchema.parse(await params);
    const body = createReviewSourceSchema.parse(await readJsonRequest(request));
    const data = await createReviewSource(context, restaurantId, body);

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
