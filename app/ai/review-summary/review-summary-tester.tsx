"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  reviewSummaryApiErrorSchema,
  reviewSummaryResponseSchema,
  type ReviewSummaryResponse
} from "@/lib/ai/review-summary-schema";

const sampleReview =
  "Dinner service was friendly and the patio felt calm, but our entrees arrived nearly 25 minutes after the appetizers. The roasted chicken was excellent, while the pasta was lukewarm. I would come back for the staff and atmosphere if the kitchen timing improves.";

const sentimentStyles: Record<ReviewSummaryResponse["sentiment"], string> = {
  positive: "border-[#3F6F52] bg-[#edf6ef] text-[#2f5a40]",
  neutral: "border-[#8B9497] bg-[#f1f2f2] text-[#4f5a5d]",
  negative: "border-[#B84A4A] bg-[#f9eeee] text-[#8f3333]",
  mixed: "border-[#B9842E] bg-[#fbf3e6] text-[#815a1e]",
  unknown: "border-[#8B9497] bg-[#f1f2f2] text-[#4f5a5d]"
};

export default function ReviewSummaryTester() {
  const [reviewText, setReviewText] = useState(sampleReview);
  const [result, setResult] = useState<ReviewSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const trimmedReviewText = useMemo(() => reviewText.trim(), [reviewText]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!trimmedReviewText) {
      setError("Enter fictional restaurant review text before generating a summary.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/review-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reviewText: trimmedReviewText })
      });

      const payload: unknown = await response.json();

      if (!response.ok) {
        const parsedError = reviewSummaryApiErrorSchema.safeParse(payload);
        setError(parsedError.success ? parsedError.data.error : "AI summary could not be generated.");
        return;
      }

      const parsedResult = reviewSummaryResponseSchema.safeParse(payload);

      if (!parsedResult.success) {
        setError("The AI response did not match the expected summary format.");
        return;
      }

      setResult(parsedResult.data);
    } catch {
      setError("AI summary could not be generated. Check the server logs and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-md border border-[#dcd4ca] bg-[#fbfaf7] p-5 shadow-sm">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-ink" htmlFor="reviewText">
            Fictional review text
          </label>
          <textarea
            className="min-h-48 resize-y rounded-md border border-[#dcd4ca] bg-[#fdfcf9] px-3 py-3 text-sm leading-6 text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-[#d9ea75]"
            id="reviewText"
            maxLength={5000}
            onChange={(event) => setReviewText(event.target.value)}
            value={reviewText}
          />
          <div className="flex items-center justify-between gap-3 text-xs text-muted">
            <span>Fictional input only</span>
            <span>{trimmedReviewText.length}/5,000</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-md bg-pine px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#184f45] focus:outline-none focus:ring-2 focus:ring-[#d9ea75] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Analyzing..." : "Analyze review"}
          </button>
          <button
            className="rounded-md border border-[#dcd4ca] bg-[#fdfcf9] px-4 py-2.5 text-sm font-medium text-ink transition hover:border-pine focus:outline-none focus:ring-2 focus:ring-[#d9ea75] focus:ring-offset-2"
            onClick={() => {
              setReviewText(sampleReview);
              setResult(null);
              setError(null);
            }}
            type="button"
          >
            Reset sample
          </button>
        </div>
      </form>

      {error ? (
        <p className="mt-5 rounded-md border border-[#B84A4A] bg-[#f9eeee] px-4 py-3 text-sm text-[#8f3333]">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-6 grid gap-4 border-t border-[#dcd4ca] pt-5">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                sentimentStyles[result.sentiment]
              }`}
            >
              {result.sentiment}
            </span>
            <span className="text-sm font-medium text-muted">Generated draft</span>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Summary</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{result.summary}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Key themes</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {result.keyThemes.map((theme) => (
                <li
                  className="rounded-full border border-[#dcd4ca] bg-[#fdfcf9] px-3 py-1 text-sm text-ink"
                  key={theme}
                >
                  {theme}
                </li>
              ))}
            </ul>
          </div>

          <p className="rounded-md border border-[#B9842E] bg-[#fbf3e6] px-4 py-3 text-sm leading-6 text-[#815a1e]">
            Needs human review before use in dashboards, reports, or client-facing business
            advice. This draft is generated from the submitted review text and is not saved.
          </p>
        </div>
      ) : null}
    </section>
  );
}

