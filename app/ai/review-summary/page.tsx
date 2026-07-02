import ReviewSummaryTester from "@/app/ai/review-summary/review-summary-tester";

export const metadata = {
  title: "AI Review Summary Test",
  description: "Test Gemini review summarization with fictional restaurant review text."
};

export default function ReviewSummaryPage() {
  return (
    <main className="min-h-screen bg-canvas px-5 py-8 text-ink sm:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-md border border-[#dcd4ca] bg-[#fbfaf7] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-pine">AI workspace</p>
          <h1 className="mt-3 text-2xl font-semibold">Review summary test</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Use fictional restaurant review text only. Results are draft assistance for analyst
            review and are not saved.
          </p>
        </aside>

        <ReviewSummaryTester />
      </div>
    </main>
  );
}

