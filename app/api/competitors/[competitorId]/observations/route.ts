import { NextResponse, type NextRequest } from "next/server";
import {
  competitorRouteParamsSchema,
  createCompetitorObservation,
  createCompetitorObservationSchema
} from "@/lib/competitors";
import { handleApiError, readJsonRequest } from "@/lib/api-errors";
import { getRequestContext } from "@/lib/request-context";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    competitorId: string;
  }>;
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const context = await getRequestContext(request);
    const { competitorId } = competitorRouteParamsSchema.parse(await params);
    const body = createCompetitorObservationSchema.parse(await readJsonRequest(request));
    const data = await createCompetitorObservation(context, competitorId, body);

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
