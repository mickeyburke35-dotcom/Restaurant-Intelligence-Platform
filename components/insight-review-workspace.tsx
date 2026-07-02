"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export type InsightReviewSourceView = {
  evidenceExcerpt: string | null;
  id: string;
  rating: number | null;
  reviewId: string;
  reviewUrl: string | null;
  sentiment: string;
  sourceName: string;
  sourceType: string;
  title: string | null;
  publishedAt: string;
};

export type InsightReviewView = {
  confidence: number | null;
  confidenceLevel: string | null;
  generatedAt: string;
  highImpact: boolean;
  id: string;
  locationName: string | null;
  model: string;
  promptVersion: string | null;
  restaurantName: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewNotes: string | null;
  sentiment: string;
  sourceReviewCount: number;
  sources: InsightReviewSourceView[];
  status: string;
  summary: string;
  themes: string[];
  title: string;
  type: string;
};

export type InsightReviewOptionView = {
  excerpt: string;
  id: string;
  locationId: string;
  locationName: string;
  publishedAt: string;
  rating: number | null;
  restaurantId: string;
  restaurantName: string;
  sentiment: string;
  sourceName: string;
  sourceType: string;
  title: string | null;
};

export type InsightRestaurantOptionView = {
  id: string;
  name: string;
  segment: string | null;
};

export type InsightLocationOptionView = {
  city: string | null;
  id: string;
  name: string;
  region: string | null;
  restaurantId: string;
};

export type InsightReviewWorkspaceData = {
  insights: InsightReviewView[];
  locations: InsightLocationOptionView[];
  restaurants: InsightRestaurantOptionView[];
  reviewOptions: InsightReviewOptionView[];
};

type InsightReviewWorkspaceProps = {
  canManage: boolean;
  data: InsightReviewWorkspaceData;
  initialInsightId?: string;
  initialRestaurantId?: string;
  initialStatus?: string;
};

type ApiErrorPayload = {
  error?: string | {
    message?: string;
  };
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC"
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
  timeZone: "UTC"
});

function formatDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

function formatDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}

function formatEnum(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatRating(value: number | null): string {
  return value === null ? "Unrated" : `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)} / 5`;
}

function formatConfidence(confidence: number | null, confidenceLevel: string | null): string {
  if (confidence !== null) {
    return `${Math.round(confidence * 100)}%`;
  }

  return confidenceLevel ? formatEnum(confidenceLevel) : "Not scored";
}

function statusClassName(status: string): string {
  switch (status) {
    case "APPROVED":
      return "border-[#9cc7a9] bg-[#edf7ef] text-positive";
    case "REJECTED":
      return "border-[#e3aaa5] bg-[#fff1ef] text-negative";
    case "DRAFT":
      return "border-[#d8c27f] bg-[#fff8e8] text-mixed";
    default:
      return "border-line bg-snow text-muted";
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    default:
      return formatEnum(status);
  }
}

function decisionLabel(status: string): string {
  switch (status) {
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    default:
      return "Pending";
  }
}

function reportEligibilityLabel(status: string): string {
  return status === "APPROVED" ? "Future reports" : "Not report eligible";
}

function reportEligibilityClassName(status: string): string {
  return status === "APPROVED"
    ? "border-[#9cc7a9] bg-[#edf7ef] text-positive"
    : "border-line bg-snow text-muted";
}

function sentimentClassName(sentiment: string): string {
  switch (sentiment) {
    case "POSITIVE":
      return "border-[#b9d4c1] bg-[#edf7ef] text-positive";
    case "NEGATIVE":
      return "border-[#e7bbb8] bg-[#fff1ef] text-negative";
    case "MIXED":
      return "border-[#ead7a7] bg-[#fff8e8] text-mixed";
    case "NEUTRAL":
      return "border-line bg-[#f2f3ef] text-neutral";
    default:
      return "border-line bg-snow text-muted";
  }
}

function apiErrorMessage(payload: ApiErrorPayload, fallback: string): string {
  if (typeof payload.error === "string") {
    return payload.error;
  }

  if (payload.error?.message) {
    return payload.error.message;
  }

  return fallback;
}

export function InsightReviewWorkspace({
  canManage,
  data,
  initialInsightId,
  initialRestaurantId,
  initialStatus
}: InsightReviewWorkspaceProps) {
  const router = useRouter();
  const firstRestaurantId = initialRestaurantId ?? data.restaurants[0]?.id ?? "";
  const firstInsightId = initialInsightId ?? data.insights[0]?.id ?? "";
  const [selectedInsightId, setSelectedInsightId] = useState(firstInsightId);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(firstRestaurantId);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]);
  const [reviewNotes, setReviewNotes] = useState("");
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; text: string } | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeReviewAction, setActiveReviewAction] = useState<string | null>(null);

  const selectedInsight =
    data.insights.find((insight) => insight.id === selectedInsightId) ?? data.insights[0] ?? null;
  const selectedInsightIsDraft = selectedInsight?.status === "DRAFT";
  const selectedInsightHasDecision =
    selectedInsight?.status === "APPROVED" || selectedInsight?.status === "REJECTED";

  const visibleLocations = useMemo(
    () => data.locations.filter((location) => location.restaurantId === selectedRestaurantId),
    [data.locations, selectedRestaurantId]
  );
  const visibleReviews = useMemo(
    () =>
      data.reviewOptions.filter((review) => {
        if (review.restaurantId !== selectedRestaurantId) {
          return false;
        }

        return selectedLocationId ? review.locationId === selectedLocationId : true;
      }),
    [data.reviewOptions, selectedLocationId, selectedRestaurantId]
  );

  const draftCount = data.insights.filter((insight) => insight.status === "DRAFT").length;
  const approvedCount = data.insights.filter((insight) => insight.status === "APPROVED").length;
  const rejectedCount = data.insights.filter((insight) => insight.status === "REJECTED").length;
  const selectedRestaurant = data.restaurants.find(
    (restaurant) => restaurant.id === selectedRestaurantId
  );

  useEffect(() => {
    setReviewNotes("");
  }, [selectedInsightId]);

  function toggleReview(reviewId: string) {
    setSelectedReviewIds((current) =>
      current.includes(reviewId)
        ? current.filter((currentReviewId) => currentReviewId !== reviewId)
        : [...current, reviewId]
    );
  }

  async function submitGeneration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!selectedRestaurantId || selectedReviewIds.length === 0) {
      setFeedback({ tone: "error", text: "Select a restaurant and at least one review." });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/insights/generate", {
        body: JSON.stringify({
          locationId: selectedLocationId || null,
          restaurantId: selectedRestaurantId,
          reviewIds: selectedReviewIds
        }),
        headers: {
          "content-type": "application/json"
        },
        method: "POST"
      });
      const payload = (await response.json()) as ApiErrorPayload & { data?: unknown[] };

      if (!response.ok) {
        throw new Error(apiErrorMessage(payload, "Draft insights could not be generated."));
      }

      setFeedback({
        tone: "success",
        text: `Generated ${payload.data?.length ?? 0} draft insight${
          payload.data?.length === 1 ? "" : "s"
        }.`
      });
      setSelectedReviewIds([]);
      router.refresh();
    } catch (error) {
      setFeedback({
        tone: "error",
        text: error instanceof Error ? error.message : "Draft insights could not be generated."
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function submitReviewAction(insightId: string, status: "APPROVED" | "REJECTED") {
    setFeedback(null);
    setActiveReviewAction(`${insightId}:${status}`);

    try {
      const response = await fetch(`/api/insights/${insightId}`, {
        body: JSON.stringify({
          reviewNotes,
          status
        }),
        headers: {
          "content-type": "application/json"
        },
        method: "PATCH"
      });
      const payload = (await response.json()) as ApiErrorPayload;

      if (!response.ok) {
        throw new Error(apiErrorMessage(payload, "Insight review status could not be updated."));
      }

      setFeedback({
        tone: "success",
        text: status === "APPROVED" ? "Insight approved." : "Insight rejected."
      });
      setReviewNotes("");
      router.refresh();
    } catch (error) {
      setFeedback({
        tone: "error",
        text: error instanceof Error ? error.message : "Insight review status could not be updated."
      });
    } finally {
      setActiveReviewAction(null);
    }
  }

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <section className="border-b border-line bg-[#f4f5ed]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <p className="text-sm font-semibold uppercase text-pine">AI insights</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold sm:text-4xl">AI Insight Review</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted">
                Review generated insights with source evidence before approval. Only approved
                insights are marked for future report use.
              </p>
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-4">
              <div className="rounded-md border border-line bg-white px-4 py-3">
                <span className="block text-xs font-semibold uppercase text-muted">Total</span>
                <span className="mt-1 block text-xl font-semibold">{data.insights.length}</span>
              </div>
              <div className="rounded-md border border-[#ead7a7] bg-[#fff8e8] px-4 py-3">
                <span className="block text-xs font-semibold uppercase text-muted">Draft</span>
                <span className="mt-1 block text-xl font-semibold text-mixed">{draftCount}</span>
              </div>
              <div className="rounded-md border border-[#b9d4c1] bg-[#edf7ef] px-4 py-3">
                <span className="block text-xs font-semibold uppercase text-muted">Approved</span>
                <span className="mt-1 block text-xl font-semibold text-positive">
                  {approvedCount}
                </span>
              </div>
              <div className="rounded-md border border-[#e3aaa5] bg-[#fff1ef] px-4 py-3">
                <span className="block text-xs font-semibold uppercase text-muted">Rejected</span>
                <span className="mt-1 block text-xl font-semibold text-negative">
                  {rejectedCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-8 xl:grid-cols-[390px_minmax(0,1fr)]">
        <aside className="grid content-start gap-5">
          {canManage ? (
            <form
              className="rounded-lg border border-line bg-white p-4 shadow-soft"
              onSubmit={submitGeneration}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Generate draft insights</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {selectedRestaurant?.name ?? "Select a restaurant"} review evidence
                  </p>
                </div>
                <span className="rounded-md border border-line bg-snow px-2 py-1 text-xs font-semibold text-muted">
                  DRAFT
                </span>
              </div>

              <div className="mt-5 grid gap-4">
                <label className="grid gap-2 text-sm font-medium text-muted">
                  Restaurant
                  <select
                    className="h-11 rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                    onChange={(event) => {
                      setSelectedRestaurantId(event.target.value);
                      setSelectedLocationId("");
                      setSelectedReviewIds([]);
                    }}
                    value={selectedRestaurantId}
                  >
                    {data.restaurants.map((restaurant) => (
                      <option key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-medium text-muted">
                  Location
                  <select
                    className="h-11 rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                    onChange={(event) => {
                      setSelectedLocationId(event.target.value);
                      setSelectedReviewIds([]);
                    }}
                    value={selectedLocationId}
                  >
                    <option value="">All locations</option>
                    {visibleLocations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                        {location.city ? ` - ${location.city}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-5 rounded-md border border-line bg-[#fbfaf7]">
                <div className="flex items-center justify-between border-b border-line px-3 py-2">
                  <p className="text-sm font-semibold">Source reviews</p>
                  <p className="text-xs font-medium text-muted">{selectedReviewIds.length} selected</p>
                </div>
                <div className="max-h-[360px] overflow-y-auto p-2">
                  {visibleReviews.length > 0 ? (
                    <div className="grid gap-2">
                      {visibleReviews.map((review) => (
                        <label
                          className="grid cursor-pointer grid-cols-[auto_1fr] gap-3 rounded-md border border-transparent px-2 py-2 text-sm hover:border-line hover:bg-white"
                          key={review.id}
                        >
                          <input
                            checked={selectedReviewIds.includes(review.id)}
                            className="mt-1 h-4 w-4 accent-pine"
                            onChange={() => toggleReview(review.id)}
                            type="checkbox"
                          />
                          <span>
                            <span className="block font-semibold text-ink">
                              {review.title?.trim() || `${formatRating(review.rating)} review`}
                            </span>
                            <span className="mt-1 block text-xs text-muted">
                              {formatDate(review.publishedAt)} - {review.locationName} -{" "}
                              {formatEnum(review.sentiment)}
                            </span>
                            <span className="mt-1 block leading-5 text-muted">{review.excerpt}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 py-8 text-center text-sm leading-6 text-muted">
                      No approved imported reviews are available for this selection.
                    </div>
                  )}
                </div>
              </div>

              <button
                className="mt-4 h-10 w-full rounded-md bg-pine px-4 text-sm font-semibold text-white transition hover:bg-pine-dark disabled:cursor-not-allowed disabled:bg-[#9bb4ad]"
                disabled={isGenerating || !selectedRestaurantId || selectedReviewIds.length === 0}
                type="submit"
              >
                {isGenerating ? "Generating drafts" : "Generate drafts"}
              </button>
            </form>
          ) : null}

          {feedback ? (
            <div
              className={`rounded-md border px-4 py-3 text-sm ${
                feedback.tone === "success"
                  ? "border-[#b9d4c1] bg-[#edf7ef] text-positive"
                  : "border-[#e7bbb8] bg-[#fff1ef] text-negative"
              }`}
            >
              {feedback.text}
            </div>
          ) : null}

          <section className="overflow-hidden rounded-lg border border-line bg-white shadow-soft">
            <div className="border-b border-line px-4 py-3">
              <h2 className="text-lg font-semibold">Review queue</h2>
              {initialStatus ? (
                <p className="mt-1 text-sm text-muted">Filtered to {formatEnum(initialStatus)}</p>
              ) : null}
            </div>
            {data.insights.length > 0 ? (
              <div className="divide-y divide-[#e7ebe4]">
                {data.insights.map((insight) => (
                  <button
                    className={`w-full px-4 py-4 text-left transition hover:bg-[#f7f8f1] ${
                      selectedInsight?.id === insight.id ? "bg-[#eef6f2]" : "bg-white"
                    }`}
                    key={insight.id}
                    onClick={() => setSelectedInsightId(insight.id)}
                    type="button"
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{insight.title}</span>
                        <span className="mt-1 block text-xs text-muted">
                          {insight.restaurantName} - {formatDate(insight.generatedAt)}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold ${statusClassName(
                          insight.status
                        )}`}
                      >
                        {statusLabel(insight.status)}
                      </span>
                    </span>
                    <span className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
                      <span>{formatEnum(insight.type)}</span>
                      <span>{formatConfidence(insight.confidence, insight.confidenceLevel)}</span>
                      <span>{insight.sourceReviewCount} reviews</span>
                      <span
                        className={`rounded-md border px-2 py-0.5 font-semibold ${reportEligibilityClassName(
                          insight.status
                        )}`}
                      >
                        {reportEligibilityLabel(insight.status)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-5 py-10 text-center text-sm leading-6 text-muted">
                No AI insights are ready for review.
              </div>
            )}
          </section>
        </aside>

        <section className="min-w-0">
          {selectedInsight ? (
            <article className="rounded-lg border border-line bg-white p-5 shadow-soft">
              <div className="flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${statusClassName(
                        selectedInsight.status
                      )}`}
                    >
                      {statusLabel(selectedInsight.status)}
                    </span>
                    <span
                      className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${reportEligibilityClassName(
                        selectedInsight.status
                      )}`}
                    >
                      {reportEligibilityLabel(selectedInsight.status)}
                    </span>
                    <span
                      className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${sentimentClassName(
                        selectedInsight.sentiment
                      )}`}
                    >
                      {formatEnum(selectedInsight.sentiment)}
                    </span>
                    {selectedInsight.highImpact ? (
                      <span className="rounded-md border border-[#ead7a7] bg-[#fff8e8] px-2.5 py-1 text-xs font-semibold text-mixed">
                        Human review
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold leading-tight">{selectedInsight.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {selectedInsight.restaurantName}
                    {selectedInsight.locationName ? ` - ${selectedInsight.locationName}` : ""}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4 lg:min-w-[460px]">
                  <div className="rounded-md border border-line bg-snow px-3 py-2">
                    <span className="block text-xs font-semibold uppercase text-muted">
                      Confidence
                    </span>
                    <span className="mt-1 block font-semibold">
                      {formatConfidence(selectedInsight.confidence, selectedInsight.confidenceLevel)}
                    </span>
                  </div>
                  <div className="rounded-md border border-line bg-snow px-3 py-2">
                    <span className="block text-xs font-semibold uppercase text-muted">Sources</span>
                    <span className="mt-1 block font-semibold">
                      {selectedInsight.sourceReviewCount}
                    </span>
                  </div>
                  <div className="rounded-md border border-line bg-snow px-3 py-2">
                    <span className="block text-xs font-semibold uppercase text-muted">Model</span>
                    <span className="mt-1 block truncate font-semibold">{selectedInsight.model}</span>
                  </div>
                  <div className="rounded-md border border-line bg-snow px-3 py-2">
                    <span className="block text-xs font-semibold uppercase text-muted">Generated</span>
                    <span className="mt-1 block font-semibold">
                      {formatDate(selectedInsight.generatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div>
                  <h3 className="text-sm font-semibold uppercase text-muted">Insight text</h3>
                  <p className="mt-3 whitespace-pre-wrap text-base leading-7">
                    {selectedInsight.summary}
                  </p>

                  {selectedInsight.themes.length > 0 ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {selectedInsight.themes.map((theme) => (
                        <span
                          className="rounded-md border border-line bg-snow px-2.5 py-1 text-sm text-ink"
                          key={theme}
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <dl className="grid content-start gap-3 text-sm">
                  <div className="rounded-md border border-line bg-snow px-3 py-2">
                    <dt className="font-medium text-muted">Approval status</dt>
                    <dd className="mt-1 font-semibold">{statusLabel(selectedInsight.status)}</dd>
                  </div>
                  <div className="rounded-md border border-line bg-snow px-3 py-2">
                    <dt className="font-medium text-muted">Prompt version</dt>
                    <dd className="mt-1 break-words font-semibold">
                      {selectedInsight.promptVersion ?? "Not recorded"}
                    </dd>
                  </div>
                  <div className="rounded-md border border-line bg-snow px-3 py-2">
                    <dt className="font-medium text-muted">Report use</dt>
                    <dd className="mt-1 font-semibold">
                      {selectedInsight.status === "APPROVED"
                        ? "Eligible for future reports"
                        : "Excluded from future reports"}
                    </dd>
                  </div>
                </dl>
              </div>

              <section className="rounded-md border border-line bg-[#fbfaf7] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold uppercase text-muted">Decision audit</h3>
                    <p className="mt-2 text-base font-semibold">
                      {selectedInsightHasDecision
                        ? `${decisionLabel(selectedInsight.status)} insight`
                        : "Draft awaiting decision"}
                    </p>
                  </div>
                  <span
                    className={`w-fit rounded-md border px-2.5 py-1 text-xs font-semibold ${statusClassName(
                      selectedInsight.status
                    )}`}
                  >
                    {statusLabel(selectedInsight.status)}
                  </span>
                </div>

                <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                  <div className="rounded-md border border-line bg-white px-3 py-2">
                    <dt className="font-medium text-muted">Decision time</dt>
                    <dd className="mt-1 font-semibold">
                      {selectedInsight.reviewedAt
                        ? formatDateTime(selectedInsight.reviewedAt)
                        : "Not reviewed yet"}
                    </dd>
                  </div>
                  <div className="rounded-md border border-line bg-white px-3 py-2">
                    <dt className="font-medium text-muted">Reviewer</dt>
                    <dd className="mt-1 font-semibold">
                      {selectedInsight.reviewedBy ?? "Not recorded"}
                    </dd>
                  </div>
                  <div className="rounded-md border border-line bg-white px-3 py-2">
                    <dt className="font-medium text-muted">Report eligibility</dt>
                    <dd className="mt-1 font-semibold">
                      {selectedInsight.status === "APPROVED"
                        ? "Approved for future reports"
                        : "Not available for future reports"}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 rounded-md border border-line bg-white px-3 py-3 text-sm">
                  <p className="font-medium text-muted">Decision note</p>
                  <p className="mt-2 leading-6 text-ink">
                    {selectedInsight.reviewNotes?.trim() ||
                      (selectedInsightHasDecision
                        ? "No decision note was recorded."
                        : "A note will be recorded when this draft is approved or rejected.")}
                  </p>
                </div>
              </section>

              <section className="border-t border-line pt-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-semibold uppercase text-muted">
                    Supporting review excerpts
                  </h3>
                  <span className="text-sm text-muted">
                    {selectedInsight.sources.length} linked reviews
                  </span>
                </div>
                <div className="mt-4 grid gap-3">
                  {selectedInsight.sources.map((source) => (
                    <div className="rounded-md border border-line bg-snow p-4" key={source.id}>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold">
                            {source.title?.trim() || `${formatRating(source.rating)} review`}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            {formatDate(source.publishedAt)} - {source.sourceName} -{" "}
                            {formatEnum(source.sentiment)}
                          </p>
                        </div>
                        {source.reviewUrl ? (
                          <a
                            className="text-sm font-semibold text-pine underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2"
                            href={source.reviewUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Source
                          </a>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted">
                        {source.evidenceExcerpt ?? "No excerpt recorded."}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {canManage ? (
                <section className="mt-6 border-t border-line pt-5">
                  {selectedInsightIsDraft ? (
                    <>
                      <label className="grid gap-2 text-sm font-medium text-muted">
                        Decision note
                        <textarea
                          className="min-h-24 rounded-md border border-line bg-snow px-3 py-2 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                          onChange={(event) => setReviewNotes(event.target.value)}
                          placeholder="Record the reason for the approval or rejection."
                          value={reviewNotes}
                        />
                      </label>
                      <p className="mt-3 text-sm leading-6 text-muted">
                        Approving marks this insight for future report use. Draft and rejected
                        insights stay out of reports.
                      </p>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <button
                          className="h-10 rounded-md bg-pine px-4 text-sm font-semibold text-white transition hover:bg-pine-dark disabled:cursor-not-allowed disabled:bg-[#9bb4ad]"
                          disabled={activeReviewAction !== null}
                          onClick={() => submitReviewAction(selectedInsight.id, "APPROVED")}
                          type="button"
                        >
                          {activeReviewAction === `${selectedInsight.id}:APPROVED`
                            ? "Approving"
                            : "Approve"}
                        </button>
                        <button
                          className="h-10 rounded-md border border-negative px-4 text-sm font-semibold text-negative transition hover:bg-[#fff1ef] disabled:cursor-not-allowed disabled:border-[#d8b9b5] disabled:text-[#a9827c]"
                          disabled={activeReviewAction !== null}
                          onClick={() => submitReviewAction(selectedInsight.id, "REJECTED")}
                          type="button"
                        >
                          {activeReviewAction === `${selectedInsight.id}:REJECTED`
                            ? "Rejecting"
                            : "Reject"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-md border border-line bg-snow px-4 py-3 text-sm leading-6 text-muted">
                      <p className="font-semibold text-ink">
                        {selectedInsight.status === "APPROVED"
                          ? "Approved insight locked"
                          : "Decision recorded"}
                      </p>
                      <p className="mt-1">
                        Reviewed insights are locked for auditability. Approved insights are the
                        only insights marked for future report use.
                      </p>
                    </div>
                  )}
                </section>
              ) : null}
            </article>
          ) : (
            <div className="flex min-h-[520px] items-center justify-center rounded-lg border border-dashed border-line bg-panel p-8 text-center text-sm leading-6 text-muted">
              No AI insights are available for this agency.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
