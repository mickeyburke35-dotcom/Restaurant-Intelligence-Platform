import { NextResponse, type NextRequest } from "next/server";
import {
  archiveReviewSource,
  reviewSourceRouteParamsSchema,
  updateReviewSource,
  updateReviewSourceSchema
} from "@/lib/review-sources";
import { handleApiError, readJsonRequest } from "@/lib/api-errors";
import {
  assertCanManageReviewSources,
  getRequestContext
} from "@/lib/request-context";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    reviewSourceId: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const context = await getRequestContext(request);
    assertCanManageReviewSources(context);

    const { reviewSourceId } = reviewSourceRouteParamsSchema.parse(await params);
    const body = updateReviewSourceSchema.parse(await readJsonRequest(request));
    const data = await updateReviewSource(context, reviewSourceId, body);

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const context = await getRequestContext(request);
    assertCanManageReviewSources(context);

    const { reviewSourceId } = reviewSourceRouteParamsSchema.parse(await params);
    const data = await archiveReviewSource(context, reviewSourceId);

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
