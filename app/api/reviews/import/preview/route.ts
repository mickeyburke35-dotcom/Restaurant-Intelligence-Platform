import { NextResponse, type NextRequest } from "next/server";
import { handleApiError, readJsonRequest } from "@/lib/api-errors";
import {
  previewReviewImport,
  reviewImportRequestSchema
} from "@/lib/review-imports";
import {
  assertCanManageReviewSources,
  getRequestContext
} from "@/lib/request-context";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const context = await getRequestContext(request);
    assertCanManageReviewSources(context);

    const body = reviewImportRequestSchema.parse(await readJsonRequest(request));
    const data = await previewReviewImport(context, body);

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
