import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { generateReviewSummary, GeminiReviewSummaryError } from "@/lib/ai/review-summary";
import { reviewSummaryRequestSchema } from "@/lib/ai/review-summary-schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reviewText } = reviewSummaryRequestSchema.parse(body);
    const result = await generateReviewSummary(reviewText);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
    }

    if (error instanceof GeminiReviewSummaryError) {
      console.error("Review summary AI call failed", {
        message: error.message,
        details: error.details
      });

      if (error.message.includes("not configured")) {
        return NextResponse.json(
          { error: "AI service is not configured. Add GOOGLE_AI_API_KEY on the server." },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: "AI summary could not be generated right now." },
        { status: 502 }
      );
    }

    console.error("Unexpected review summary API error", error);

    return NextResponse.json(
      { error: "AI summary could not be generated right now." },
      { status: 500 }
    );
  }
}

