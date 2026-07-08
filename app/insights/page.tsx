import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { ZodError } from "zod";
import { DemoHubLink } from "@/components/demo-hub-link";
import {
  InsightReviewWorkspace,
  type InsightLocationOptionView,
  type InsightRestaurantOptionView,
  type InsightReviewOptionView,
  type InsightReviewSourceView,
  type InsightReviewView,
  type InsightReviewWorkspaceData
} from "@/components/insight-review-workspace";
import { ApiError } from "@/lib/api-errors";
import {
  canManageInsights,
  getInsightReviewPageData,
  parseListInsightsSearchParams,
  type InsightReviewItem,
  type InsightReviewOption
} from "@/lib/insights";
import { AccessError, getRequestContext } from "@/lib/request-context";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Insight Review | Restaurant Intelligence Platform",
  description: "Tenant-scoped AI insight generation, evidence review, and human approval."
};

type InsightsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type DecimalLike = {
  toString(): string;
};

function pageErrorMessage(error: unknown): string {
  if (error instanceof ApiError || error instanceof AccessError) {
    return error.message;
  }

  if (error instanceof ZodError) {
    return "One or more insight filters are invalid.";
  }

  console.error(error);

  return "The AI insight review page could not be loaded.";
}

function InsightPageError({
  message,
  title
}: {
  message: string;
  title: string;
}) {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16 sm:px-10">
        <DemoHubLink />
        <p className="mt-4 text-sm font-semibold uppercase text-pine">AI insights</p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{title}</h1>
        <p className="mt-4 text-base leading-7 text-muted">{message}</p>
        <div className="mt-6 rounded-md border border-line bg-panel px-4 py-3 text-sm leading-6 text-muted">
          Reset the insight filters first. If the page still cannot load, confirm the active agency
          context and that the selected insight belongs to that agency.
        </div>
        <Link
          className="mt-8 inline-flex w-fit rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-pine hover:text-pine focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2"
          href="/insights"
        >
          Reset insights
        </Link>
      </section>
    </main>
  );
}

async function getPageRequestContext() {
  const incomingHeaders = await headers();
  const request = new Request("https://restaurant-intelligence.local/insights", {
    headers: new Headers(incomingHeaders)
  });

  return getRequestContext(request);
}

export default async function InsightsPage({ searchParams }: InsightsPageProps) {
  const resolvedSearchParams = await searchParams;
  let query;

  try {
    query = parseListInsightsSearchParams(resolvedSearchParams);
  } catch (error) {
    return (
      <InsightPageError
        message={pageErrorMessage(error)}
        title="Insight filters need attention"
      />
    );
  }

  try {
    const context = await getPageRequestContext();
    const pageData = await getInsightReviewPageData(context, query);

    return (
      <InsightReviewWorkspace
        canManage={canManageInsights(context)}
        data={serializeInsightReviewPageData(pageData)}
        initialInsightId={query.insightId}
        initialRestaurantId={query.restaurantId}
        initialStatus={query.status}
      />
    );
  } catch (error) {
    return (
      <InsightPageError
        message={pageErrorMessage(error)}
        title="AI insight review unavailable"
      />
    );
  }
}

function serializeInsightReviewPageData(data: Awaited<ReturnType<typeof getInsightReviewPageData>>): InsightReviewWorkspaceData {
  return {
    insights: data.insights.map(serializeInsight),
    locations: data.locations.map(
      (location): InsightLocationOptionView => ({
        city: location.city,
        id: location.id,
        name: location.name,
        region: location.region,
        restaurantId: location.restaurantId
      })
    ),
    restaurants: data.restaurants.map(
      (restaurant): InsightRestaurantOptionView => ({
        id: restaurant.id,
        name: restaurant.name,
        segment: restaurant.segment
      })
    ),
    reviewOptions: data.reviewOptions.map(serializeReviewOption)
  };
}

function serializeInsight(insight: InsightReviewItem): InsightReviewView {
  return {
    confidence: decimalToNumber(insight.confidence),
    confidenceLevel: insight.confidenceLevel,
    generatedAt: insight.generatedAt.toISOString(),
    highImpact: insight.highImpact,
    id: insight.id,
    locationName: insight.location ? formatLocationName(insight.location) : null,
    model: insight.model,
    promptVersion: insight.promptVersion,
    restaurantName: insight.restaurant.name,
    reviewedAt: insight.reviewedAt?.toISOString() ?? null,
    reviewedBy: insight.reviewedBy?.name ?? insight.reviewedBy?.email ?? null,
    reviewNotes: insight.reviewNotes,
    sentiment: insight.sentiment,
    sourceReviewCount: insight.sourceReviewCount,
    sources: insight.sourceReviews.map(
      (source): InsightReviewSourceView => ({
        evidenceExcerpt: source.evidenceExcerpt,
        id: source.id,
        rating: decimalToNumber(source.review.rating),
        reviewId: source.review.id,
        reviewUrl: source.review.reviewUrl,
        sentiment: source.review.sentiment,
        sourceName: source.review.reviewSource.name,
        sourceType: source.review.reviewSource.sourceType,
        title: source.review.title,
        publishedAt: source.review.publishedAt.toISOString()
      })
    ),
    status: insight.status,
    summary: insight.summary,
    themes: insight.themes,
    title: insight.title,
    type: insight.type
  };
}

function serializeReviewOption(review: InsightReviewOption): InsightReviewOptionView {
  return {
    excerpt: reviewExcerpt(review.text, review.title),
    id: review.id,
    locationId: review.locationId,
    locationName: formatLocationName(review.location),
    publishedAt: review.publishedAt.toISOString(),
    rating: decimalToNumber(review.rating),
    restaurantId: review.restaurantId,
    restaurantName: review.restaurant.name,
    sentiment: review.sentiment,
    sourceName: review.reviewSource.name,
    sourceType: review.reviewSource.sourceType,
    title: review.title
  };
}

function decimalToNumber(value: DecimalLike | number | string | null): number | null {
  if (value === null) {
    return null;
  }

  const parsed = Number(value.toString());

  return Number.isFinite(parsed) ? parsed : null;
}

function formatLocationName(location: {
  city: string | null;
  name: string;
  region: string | null;
}): string {
  return [location.name, location.city, location.region].filter(Boolean).join(", ");
}

function reviewExcerpt(text: string | null, title: string | null): string {
  const value = text?.trim() || title?.trim() || "No review text recorded.";

  return value.length > 150 ? `${value.slice(0, 147)}...` : value;
}
