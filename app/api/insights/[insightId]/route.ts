import { NextResponse, type NextRequest } from "next/server";
import { handleApiError, readJsonRequest } from "@/lib/api-errors";
import {
  insightRouteParamsSchema,
  reviewInsightActionSchema,
  reviewInsightStatus
} from "@/lib/insights";
import { getRequestContext } from "@/lib/request-context";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    insightId: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const context = await getRequestContext(request);
    const { insightId } = insightRouteParamsSchema.parse(await params);
    const body = reviewInsightActionSchema.parse(await readJsonRequest(request));
    const data = await reviewInsightStatus(context, insightId, body);

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
