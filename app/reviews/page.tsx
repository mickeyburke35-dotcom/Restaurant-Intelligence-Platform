import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { ZodError } from "zod";
import { DemoHubLink } from "@/components/demo-hub-link";
import { ApiError } from "@/lib/api-errors";
import { getRequestContext } from "@/lib/request-context";
import {
  getReviewDetail,
  listReviewFilterOptions,
  listReviews,
  parseListReviewsSearchParams,
  parseSelectedReviewIdSearchParams,
  type ReviewDetailResponse
} from "@/lib/reviews";
import { ReviewDashboard } from "@/components/review-dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Review Dashboard | Restaurant Intelligence Platform",
  description: "Tenant-scoped restaurant review list, filters, sorting, pagination, and detail view."
};

type ReviewsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function dashboardErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof ZodError) {
    return "One or more review filters are invalid.";
  }

  console.error(error);

  return "The review dashboard could not be loaded.";
}

function ReviewDashboardError({
  title,
  message
}: {
  title: string;
  message: string;
}) {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16 sm:px-10">
        <DemoHubLink />
        <p className="mt-4 text-sm font-semibold uppercase text-pine">Reviews</p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{title}</h1>
        <p className="mt-4 text-base leading-7 text-muted">{message}</p>
        <Link
          className="mt-8 inline-flex w-fit rounded-md border border-[#cfd8cf] bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-pine hover:text-pine focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2"
          href="/reviews"
        >
          Reset dashboard
        </Link>
      </section>
    </main>
  );
}

async function getPageRequestContext() {
  const incomingHeaders = await headers();
  const request = new Request("https://restaurant-intelligence.local/reviews", {
    headers: new Headers(incomingHeaders)
  });

  return getRequestContext(request);
}

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const resolvedSearchParams = await searchParams;
  let query;
  let selectedReviewId: string | undefined;

  try {
    query = parseListReviewsSearchParams(resolvedSearchParams);
    selectedReviewId = parseSelectedReviewIdSearchParams(resolvedSearchParams);
  } catch (error) {
    return (
      <ReviewDashboardError
        message={dashboardErrorMessage(error)}
        title="Review filters need attention"
      />
    );
  }

  let context;

  try {
    context = await getPageRequestContext();
  } catch (error) {
    return (
      <ReviewDashboardError
        message={dashboardErrorMessage(error)}
        title="Agency context required"
      />
    );
  }

  try {
    const [reviews, filters] = await Promise.all([
      listReviews(context, query),
      listReviewFilterOptions(context)
    ]);
    let selectedReview: ReviewDetailResponse | null = null;
    let selectedReviewError: string | undefined;

    if (selectedReviewId) {
      try {
        selectedReview = await getReviewDetail(context, selectedReviewId);
      } catch (error) {
        selectedReviewError = dashboardErrorMessage(error);
      }
    }

    return (
      <ReviewDashboard
        filters={filters}
        query={query}
        reviews={reviews}
        selectedReview={selectedReview}
        selectedReviewError={selectedReviewError}
        selectedReviewId={selectedReviewId}
      />
    );
  } catch (error) {
    return (
      <ReviewDashboardError
        message={dashboardErrorMessage(error)}
        title="Review dashboard unavailable"
      />
    );
  }
}
