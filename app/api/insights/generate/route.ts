import { NextResponse, type NextRequest } from "next/server";
import { GeminiReviewInsightError } from "@/lib/ai/review-insights";
import { handleApiError, readJsonRequest } from "@/lib/api-errors";
import { generateDraftInsights, generateInsightsRequestSchema } from "@/lib/insights";
import { getRequestContext } from "@/lib/request-context";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const context = await getRequestContext(request);
    const body = generateInsightsRequestSchema.parse(await readJsonRequest(request));
    const data = await generateDraftInsights(context, body);

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof GeminiReviewInsightError) {
      console.error("AI insight generation failed.", {
        details: error.details,
        message: error.message
      });

      if (error.message.includes("not configured")) {
        return NextResponse.json(
          { error: { message: "AI service is not configured. Add GOOGLE_AI_API_KEY on the server." } },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: { message: "Draft insights could not be generated right now." } },
        { status: 502 }
      );
    }

    return handleApiError(error);
  }
}
