import { NextResponse, type NextRequest } from "next/server";
import { handleApiError, readJsonRequest } from "@/lib/api-errors";
import { createApprovedInsightsReport, createReportRequestSchema } from "@/lib/reports";
import { getRequestContext } from "@/lib/request-context";

export const runtime = "nodejs";

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
