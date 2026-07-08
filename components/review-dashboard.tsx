import { Sentiment } from "@prisma/client";
import Link from "next/link";
import { DemoHubLink } from "@/components/demo-hub-link";
import type {
  ListReviewsQuery,
  ListReviewsResult,
  ReviewDetailResponse,
  ReviewFilterOptions,
  ReviewListItem,
  ReviewSortDirection,
  ReviewSortField
} from "@/lib/reviews";

type ReviewDashboardProps = {
  query: ListReviewsQuery;
  reviews: ListReviewsResult;
  filters: ReviewFilterOptions;
  selectedReview: ReviewDetailResponse | null;
  selectedReviewError?: string;
  selectedReviewId?: string;
};

type ReviewsHrefUpdates = Partial<{
  search: string | null;
  restaurantId: string | null;
  locationId: string | null;
  reviewSourceId: string | null;
  rating: number | string | null;
  sentiment: Sentiment | string | null;
  dateFrom: string | null;
  dateTo: string | null;
  sortBy: ReviewSortField;
  sortDirection: ReviewSortDirection;
  page: number;
  pageSize: number;
  reviewId: string | null;
}>;

type DecimalLike = {
  toString(): string;
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
  timeZone: "UTC"
});

const sentimentValues = [
  Sentiment.POSITIVE,
  Sentiment.NEUTRAL,
  Sentiment.NEGATIVE,
  Sentiment.MIXED,
  Sentiment.UNKNOWN
] as const;

const defaultSortBy: ReviewSortField = "publishedAt";
const defaultSortDirection: ReviewSortDirection = "desc";
const defaultPage = 1;
const defaultPageSize = 20;

function decimalToNumber(value: DecimalLike | number | string | null): number | null {
  if (value === null) {
    return null;
  }

  const parsed = Number(value.toString());

  return Number.isFinite(parsed) ? parsed : null;
}

function formatDate(value: Date): string {
  return dateFormatter.format(value);
}

function formatDateTime(value: Date): string {
  return dateTimeFormatter.format(value);
}

function formatRating(value: DecimalLike | number | string | null): string {
  const rating = decimalToNumber(value);

  if (rating === null) {
    return "Unrated";
  }

  return `${Number.isInteger(rating) ? rating.toFixed(0) : rating.toFixed(1)} / 5`;
}

function formatAverageRating(value: DecimalLike | number | string | null): string {
  const rating = decimalToNumber(value);

  if (rating === null) {
    return "No rating";
  }

  return rating.toFixed(2);
}

function formatScore(value: DecimalLike | number | string | null): string {
  const score = decimalToNumber(value);

  if (score === null) {
    return "Not scored";
  }

  return score.toFixed(2);
}

function formatEnum(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatLocationName(location: ReviewListItem["location"]): string {
  const parts = [location.name, location.city, location.region].filter(Boolean);

  return parts.join(", ");
}

function truncateText(value: string | null, maxLength = 150): string {
  if (!value?.trim()) {
    return "No review text recorded.";
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

function percentage(count: number, total: number): string {
  if (total === 0) {
    return "0%";
  }

  return `${Math.round((count / total) * 100)}%`;
}

function sentimentBadgeClass(sentiment: Sentiment): string {
  switch (sentiment) {
    case Sentiment.POSITIVE:
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case Sentiment.NEGATIVE:
      return "border-rose-200 bg-rose-50 text-rose-800";
    case Sentiment.MIXED:
      return "border-amber-200 bg-amber-50 text-amber-800";
    case Sentiment.NEUTRAL:
      return "border-sky-200 bg-sky-50 text-sky-800";
    case Sentiment.UNKNOWN:
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-700";
  }
}

function createReviewsHref(
  query: ListReviewsQuery,
  updates: ReviewsHrefUpdates = {},
  selectedReviewId?: string
): string {
  const values = {
    search: query.search,
    restaurantId: query.restaurantId,
    locationId: query.locationId,
    reviewSourceId: query.reviewSourceId,
    rating: query.rating,
    sentiment: query.sentiment,
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
    sortBy: query.sortBy,
    sortDirection: query.sortDirection,
    page: query.page,
    pageSize: query.pageSize,
    reviewId: selectedReviewId,
    ...updates
  };

  const params = new URLSearchParams();

  if (values.search) {
    params.set("search", values.search);
  }

  if (values.restaurantId) {
    params.set("restaurantId", values.restaurantId);
  }

  if (values.locationId) {
    params.set("locationId", values.locationId);
  }

  if (values.reviewSourceId) {
    params.set("reviewSourceId", values.reviewSourceId);
  }

  if (values.rating) {
    params.set("rating", String(values.rating));
  }

  if (values.sentiment) {
    params.set("sentiment", values.sentiment);
  }

  if (values.dateFrom) {
    params.set("dateFrom", values.dateFrom);
  }

  if (values.dateTo) {
    params.set("dateTo", values.dateTo);
  }

  if (values.sortBy !== defaultSortBy) {
    params.set("sortBy", values.sortBy);
  }

  if (values.sortDirection !== defaultSortDirection) {
    params.set("sortDirection", values.sortDirection);
  }

  if (values.page !== defaultPage) {
    params.set("page", String(values.page));
  }

  if (values.pageSize !== defaultPageSize) {
    params.set("pageSize", String(values.pageSize));
  }

  if (values.reviewId) {
    params.set("reviewId", values.reviewId);
  }

  const queryString = params.toString();

  return queryString ? `/reviews?${queryString}` : "/reviews";
}

function nextSortDirection(
  query: ListReviewsQuery,
  field: ReviewSortField
): ReviewSortDirection {
  if (query.sortBy === field) {
    return query.sortDirection === "asc" ? "desc" : "asc";
  }

  if (field === "restaurant" || field === "location" || field === "source") {
    return "asc";
  }

  return "desc";
}

function SortHeader({
  field,
  label,
  query
}: {
  field: ReviewSortField;
  label: string;
  query: ListReviewsQuery;
}) {
  const isActive = query.sortBy === field;

  return (
    <Link
      className="inline-flex items-center gap-2 rounded-md px-1 py-1 font-semibold text-ink underline-offset-4 hover:text-pine hover:underline focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2"
      href={createReviewsHref(query, {
        sortBy: field,
        sortDirection: nextSortDirection(query, field),
        page: 1,
        reviewId: null
      })}
    >
      <span>{label}</span>
      {isActive ? (
        <span className="text-[11px] font-medium uppercase text-pine">{query.sortDirection}</span>
      ) : null}
    </Link>
  );
}

function SummaryCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-[#d8ddd3] bg-[#fcfcf7] p-4">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-2 text-sm text-muted">{detail}</p>
    </div>
  );
}

function ReviewDetailPanel({
  query,
  review,
  selectedReviewError
}: {
  query: ListReviewsQuery;
  review: ReviewDetailResponse | null;
  selectedReviewError?: string;
}) {
  if (selectedReviewError) {
    return (
      <aside className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-900">
        <p className="text-sm font-semibold uppercase">Review detail</p>
        <h2 className="mt-3 text-xl font-semibold">Detail unavailable</h2>
        <p className="mt-3 text-sm leading-6">{selectedReviewError}</p>
        <p className="mt-2 text-sm leading-6">
          Clear the selected row and choose another review from the current agency-scoped result
          set.
        </p>
        <Link
          className="mt-5 inline-flex h-10 items-center justify-center rounded-md border border-rose-300 bg-white px-4 text-sm font-semibold text-rose-900 transition hover:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:ring-offset-rose-50"
          href={createReviewsHref(query, { reviewId: null })}
        >
          Clear selection
        </Link>
      </aside>
    );
  }

  if (!review) {
    return (
      <aside className="rounded-lg border border-[#d8ddd3] bg-[#fcfcf7] p-5">
        <p className="text-sm font-semibold uppercase text-pine">Review detail</p>
        <h2 className="mt-3 text-xl font-semibold text-ink">No review selected</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Open a review from the table to inspect the full text, source, timestamps, and trace
          fields. The detail panel stays scoped to the same agency result set.
        </p>
        <div className="mt-5 rounded-md border border-line bg-white px-3 py-3 text-sm leading-6 text-muted">
          Use this panel during demos to connect a table row with its source evidence before
          generating or approving insights.
        </div>
      </aside>
    );
  }

  return (
    <aside className="rounded-lg border border-[#cfd8cf] bg-white p-5 shadow-sm lg:sticky lg:top-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-pine">Review detail</p>
          <h2 className="mt-3 text-xl font-semibold leading-7 text-ink">
            {review.title?.trim() || "Untitled review"}
          </h2>
        </div>
        <Link
          className="rounded-md border border-[#cfd8cf] px-3 py-2 text-sm font-medium text-ink hover:border-pine hover:text-pine focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2"
          href={createReviewsHref(query, { reviewId: null })}
        >
          Close
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-md border border-[#d8ddd3] bg-[#f7f7f2] px-2.5 py-1 text-sm font-medium text-ink">
          {formatRating(review.rating)}
        </span>
        <span
          className={`rounded-md border px-2.5 py-1 text-sm font-medium ${sentimentBadgeClass(
            review.sentiment
          )}`}
        >
          {formatEnum(review.sentiment)}
        </span>
        <span className="rounded-md border border-[#d8ddd3] bg-[#f7f7f2] px-2.5 py-1 text-sm font-medium text-ink">
          Score {formatScore(review.sentimentScore)}
        </span>
      </div>

      <dl className="mt-6 grid gap-4 text-sm">
        <div>
          <dt className="font-medium text-muted">Restaurant</dt>
          <dd className="mt-1 text-ink">{review.restaurant.name}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted">Location</dt>
          <dd className="mt-1 text-ink">{formatLocationName(review.location)}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted">Source</dt>
          <dd className="mt-1 text-ink">
            {review.reviewSource.name} - {formatEnum(review.reviewSource.sourceType)}
          </dd>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-muted">Published</dt>
            <dd className="mt-1 text-ink">{formatDateTime(review.publishedAt)}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted">Collected</dt>
            <dd className="mt-1 text-ink">{formatDateTime(review.collectedAt)}</dd>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-muted">External ID</dt>
            <dd className="mt-1 break-all text-ink">{review.externalId}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted">Language</dt>
            <dd className="mt-1 text-ink">{review.language || "Not recorded"}</dd>
          </div>
        </div>
      </dl>

      <div className="mt-6 border-t border-[#e1e5dc] pt-5">
        <h3 className="text-sm font-semibold uppercase text-muted">Review text</h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink">
          {review.text?.trim() || "No review text recorded."}
        </p>
      </div>

      {review.themes.length > 0 ? (
        <div className="mt-6 border-t border-[#e1e5dc] pt-5">
          <h3 className="text-sm font-semibold uppercase text-muted">Stored themes</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {review.themes.map((theme) => (
              <span
                className="rounded-md border border-[#d8ddd3] bg-[#f7f7f2] px-2.5 py-1 text-sm text-ink"
                key={theme}
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {review.reviewUrl ? (
        <div className="mt-6 border-t border-[#e1e5dc] pt-5">
          <a
            className="text-sm font-semibold text-pine underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2"
            href={review.reviewUrl}
            rel="noreferrer"
            target="_blank"
          >
            Open source review
          </a>
        </div>
      ) : null}
    </aside>
  );
}

export function ReviewDashboard({
  query,
  reviews,
  filters,
  selectedReview,
  selectedReviewError,
  selectedReviewId
}: ReviewDashboardProps) {
  const restaurantNameById = new Map(
    filters.restaurants.map((restaurant) => [restaurant.id, restaurant.name])
  );
  const startRow =
    reviews.pagination.total === 0
      ? 0
      : (reviews.pagination.page - 1) * reviews.pagination.pageSize + 1;
  const endRow = Math.min(
    reviews.pagination.page * reviews.pagination.pageSize,
    reviews.pagination.total
  );
  const positiveCount = reviews.summary.sentimentCounts[Sentiment.POSITIVE];
  const negativeCount = reviews.summary.sentimentCounts[Sentiment.NEGATIVE];
  const hasActiveFilters = Boolean(
    query.search ||
      query.restaurantId ||
      query.locationId ||
      query.reviewSourceId ||
      query.rating ||
      query.sentiment ||
      query.dateFrom ||
      query.dateTo
  );
  const resultCountLabel =
    reviews.pagination.total > 0
      ? `Showing ${startRow}-${endRow} of ${reviews.pagination.total} reviews`
      : "No reviews in this view";

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <section className="border-b border-[#dde2d8] bg-[#f4f5ed]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <DemoHubLink />
          <p className="mt-4 text-sm font-semibold uppercase text-pine">Reviews</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold sm:text-4xl">Review Dashboard</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted">
                Tenant-scoped review monitoring for approved restaurant source data.
              </p>
            </div>
            <div className="rounded-lg border border-[#cfd8cf] bg-white px-4 py-3 text-sm text-muted">
              {resultCountLabel}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            detail={`${reviews.pagination.total} reviews in the current result set`}
            label="Filtered reviews"
            value={reviews.summary.total.toLocaleString("en-US")}
          />
          <SummaryCard
            detail="Average rating across rated reviews"
            label="Average rating"
            value={formatAverageRating(reviews.summary.averageRating)}
          />
          <SummaryCard
            detail={`${positiveCount.toLocaleString("en-US")} positive reviews`}
            label="Positive share"
            value={percentage(positiveCount, reviews.summary.total)}
          />
          <SummaryCard
            detail={`${negativeCount.toLocaleString("en-US")} negative reviews`}
            label="Negative reviews"
            value={negativeCount.toLocaleString("en-US")}
          />
        </section>

        <section className="mt-6 rounded-lg border border-[#d8ddd3] bg-white p-4 shadow-sm">
          <form action="/reviews" className="grid gap-4" method="get">
            <input name="sortBy" type="hidden" value={query.sortBy} />
            <input name="sortDirection" type="hidden" value={query.sortDirection} />

            <div className="grid gap-3 lg:grid-cols-[minmax(220px,1.3fr)_repeat(3,minmax(160px,1fr))]">
              <label className="grid gap-2 text-sm font-medium text-muted">
                Search
                <input
                  className="h-11 rounded-md border border-[#cfd8cf] bg-[#fcfcf7] px-3 text-base text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                  defaultValue={query.search ?? ""}
                  name="search"
                  placeholder="Review text, source, or external ID"
                  type="search"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-muted">
                Restaurant
                <select
                  className="h-11 rounded-md border border-[#cfd8cf] bg-[#fcfcf7] px-3 text-base text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                  defaultValue={query.restaurantId ?? ""}
                  name="restaurantId"
                >
                  <option value="">All restaurants</option>
                  {filters.restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium text-muted">
                Location
                <select
                  className="h-11 rounded-md border border-[#cfd8cf] bg-[#fcfcf7] px-3 text-base text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                  defaultValue={query.locationId ?? ""}
                  name="locationId"
                >
                  <option value="">All locations</option>
                  {filters.locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                      {location.city ? ` - ${location.city}` : ""}
                      {restaurantNameById.get(location.restaurantId)
                        ? ` (${restaurantNameById.get(location.restaurantId)})`
                        : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium text-muted">
                Source
                <select
                  className="h-11 rounded-md border border-[#cfd8cf] bg-[#fcfcf7] px-3 text-base text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                  defaultValue={query.reviewSourceId ?? ""}
                  name="reviewSourceId"
                >
                  <option value="">All sources</option>
                  {filters.sources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name} - {formatEnum(source.sourceType)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(5,minmax(140px,1fr))_auto_auto] lg:items-end">
              <label className="grid gap-2 text-sm font-medium text-muted">
                Rating
                <select
                  className="h-11 rounded-md border border-[#cfd8cf] bg-[#fcfcf7] px-3 text-base text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                  defaultValue={query.rating ?? ""}
                  name="rating"
                >
                  <option value="">All ratings</option>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} stars
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium text-muted">
                Sentiment
                <select
                  className="h-11 rounded-md border border-[#cfd8cf] bg-[#fcfcf7] px-3 text-base text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                  defaultValue={query.sentiment ?? ""}
                  name="sentiment"
                >
                  <option value="">All sentiment</option>
                  {sentimentValues.map((sentiment) => (
                    <option key={sentiment} value={sentiment}>
                      {formatEnum(sentiment)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium text-muted">
                From
                <input
                  className="h-11 rounded-md border border-[#cfd8cf] bg-[#fcfcf7] px-3 text-base text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                  defaultValue={query.dateFrom ?? ""}
                  name="dateFrom"
                  type="date"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-muted">
                To
                <input
                  className="h-11 rounded-md border border-[#cfd8cf] bg-[#fcfcf7] px-3 text-base text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                  defaultValue={query.dateTo ?? ""}
                  name="dateTo"
                  type="date"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-muted">
                Page size
                <select
                  className="h-11 rounded-md border border-[#cfd8cf] bg-[#fcfcf7] px-3 text-base text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                  defaultValue={query.pageSize}
                  name="pageSize"
                >
                  {[10, 20, 50, 100].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
              </label>

              <button
                className="h-11 w-full rounded-md bg-pine px-5 text-sm font-semibold text-white transition hover:bg-[#18584d] focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2"
                type="submit"
              >
                Apply
              </button>
              <Link
                className="flex h-11 w-full items-center justify-center rounded-md border border-[#cfd8cf] px-5 text-sm font-semibold text-ink transition hover:border-pine hover:text-pine focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2"
                href="/reviews"
              >
                Reset
              </Link>
            </div>
          </form>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
          <section className="overflow-hidden rounded-lg border border-[#d8ddd3] bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[#e1e5dc] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Reviews</h2>
                <p className="mt-1 text-sm text-muted">
                  Page {reviews.pagination.page} of {reviews.pagination.totalPages}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  aria-disabled={!reviews.pagination.hasPreviousPage}
                  className={`rounded-md border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2 ${
                    reviews.pagination.hasPreviousPage
                      ? "border-[#cfd8cf] text-ink hover:border-pine hover:text-pine"
                      : "pointer-events-none border-[#e4e7e0] text-[#9aa39a]"
                  }`}
                  href={createReviewsHref(query, {
                    page: Math.max(1, reviews.pagination.page - 1),
                    reviewId: null
                  })}
                >
                  Previous
                </Link>
                <Link
                  aria-disabled={!reviews.pagination.hasNextPage}
                  className={`rounded-md border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2 ${
                    reviews.pagination.hasNextPage
                      ? "border-[#cfd8cf] text-ink hover:border-pine hover:text-pine"
                      : "pointer-events-none border-[#e4e7e0] text-[#9aa39a]"
                  }`}
                  href={createReviewsHref(query, {
                    page: Math.min(reviews.pagination.totalPages, reviews.pagination.page + 1),
                    reviewId: null
                  })}
                >
                  Next
                </Link>
              </div>
            </div>

            {reviews.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full border-collapse text-left text-sm">
                  <thead className="bg-[#f7f7f2] text-muted">
                    <tr>
                      <th className="px-4 py-3" scope="col">
                        <SortHeader field="publishedAt" label="Date" query={query} />
                      </th>
                      <th className="px-4 py-3" scope="col">
                        <SortHeader field="rating" label="Rating" query={query} />
                      </th>
                      <th className="px-4 py-3" scope="col">
                        <SortHeader field="sentiment" label="Sentiment" query={query} />
                      </th>
                      <th className="px-4 py-3" scope="col">
                        <SortHeader field="restaurant" label="Restaurant" query={query} />
                      </th>
                      <th className="px-4 py-3" scope="col">
                        <SortHeader field="location" label="Location" query={query} />
                      </th>
                      <th className="px-4 py-3" scope="col">
                        <SortHeader field="source" label="Source" query={query} />
                      </th>
                      <th className="px-4 py-3" scope="col">
                        Review
                      </th>
                      <th className="px-4 py-3" scope="col">
                        Detail
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7ebe4]">
                    {reviews.data.map((review) => (
                      <tr
                        className={
                          selectedReviewId === review.id
                            ? "bg-[#eef6f2]"
                            : "bg-white hover:bg-[#fafbf5]"
                        }
                        key={review.id}
                      >
                        <td className="whitespace-nowrap px-4 py-4 font-medium text-ink">
                          {formatDate(review.publishedAt)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-ink">
                          {formatRating(review.rating)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <span
                            className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${sentimentBadgeClass(
                              review.sentiment
                            )}`}
                          >
                            {formatEnum(review.sentiment)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-ink">{review.restaurant.name}</td>
                        <td className="px-4 py-4 text-ink">{formatLocationName(review.location)}</td>
                        <td className="px-4 py-4 text-ink">
                          <span className="block font-medium">{review.reviewSource.name}</span>
                          <span className="mt-1 block text-xs text-muted">
                            {formatEnum(review.reviewSource.sourceType)}
                          </span>
                        </td>
                        <td className="max-w-[300px] px-4 py-4 text-muted">
                          <span className="block font-medium text-ink">
                            {review.title?.trim() || "Untitled review"}
                          </span>
                          <span className="mt-1 block leading-6">{truncateText(review.text)}</span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <Link
                            className="rounded-md border border-[#cfd8cf] px-3 py-2 text-sm font-semibold text-ink hover:border-pine hover:text-pine focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2"
                            href={createReviewsHref(query, { reviewId: review.id }, selectedReviewId)}
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5 py-14 text-center">
                <h3 className="text-lg font-semibold text-ink">
                  {hasActiveFilters ? "No reviews match these filters" : "No approved reviews yet"}
                </h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
                  {hasActiveFilters
                    ? "Adjust the search, date range, restaurant, location, source, or sentiment filters to widen the result set."
                    : "Import approved public reviews before generating insights or building report snapshots."}
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  {hasActiveFilters ? (
                    <Link
                      className="inline-flex h-10 w-full items-center justify-center rounded-md border border-[#cfd8cf] bg-white px-4 text-sm font-semibold text-ink transition hover:border-pine hover:text-pine focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2 sm:w-fit"
                      href="/reviews"
                    >
                      Reset filters
                    </Link>
                  ) : (
                    <Link
                      className="inline-flex h-10 w-full items-center justify-center rounded-md bg-pine px-4 text-sm font-semibold text-white transition hover:bg-pine-dark focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2 sm:w-fit"
                      href="/reviews/import"
                    >
                      Open import
                    </Link>
                  )}
                </div>
              </div>
            )}
          </section>

          <ReviewDetailPanel
            query={query}
            review={selectedReview}
            selectedReviewError={selectedReviewError}
          />
        </div>
      </div>
    </main>
  );
}
