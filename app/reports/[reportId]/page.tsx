import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { ZodError } from "zod";
import { DemoHubLink } from "@/components/demo-hub-link";
import { ApiError } from "@/lib/api-errors";
import {
  getReportDetail,
  parseStoredReportSections,
  reportRouteParamsSchema
} from "@/lib/reports";
import { AccessError, getRequestContext } from "@/lib/request-context";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Report Detail | Restaurant Intelligence Platform",
  description: "Approved insight report detail with source review evidence counts."
};

type ReportDetailPageProps = {
  params: Promise<{
    reportId: string;
  }>;
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

function formatDate(value: Date | string): string {
  return dateFormatter.format(new Date(value));
}

function formatDateTime(value: Date | string): string {
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

function reportDetailErrorMessage(error: unknown): string {
  if (error instanceof ApiError || error instanceof AccessError) {
    return error.message;
  }

  if (error instanceof ZodError) {
    return "The report link is invalid.";
  }

  console.error(error);

  return "The report detail could not be loaded.";
}

function statusClassName(status: string): string {
  switch (status) {
    case "READY":
      return "border-[#9cc7a9] bg-[#edf7ef] text-positive";
    case "FAILED":
      return "border-[#e3aaa5] bg-[#fff1ef] text-negative";
    case "GENERATING":
    case "QUEUED":
      return "border-[#d8c27f] bg-[#fff8e8] text-mixed";
    default:
      return "border-line bg-snow text-muted";
  }
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

function ReportDetailError({
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
        <p className="mt-5 text-sm font-semibold uppercase text-pine">Reports</p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{title}</h1>
        <p className="mt-4 text-base leading-7 text-muted">{message}</p>
        <div className="mt-6 rounded-md border border-line bg-panel px-4 py-3 text-sm leading-6 text-muted">
          Check that the report link belongs to the active agency and that the stored snapshot is
          still available.
        </div>
        <Link
          className="mt-8 inline-flex w-fit rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-pine hover:text-pine focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2"
          href="/reports"
        >
          Back to reports
        </Link>
      </section>
    </main>
  );
}

async function getPageRequestContext(reportId: string) {
  const incomingHeaders = await headers();
  const request = new Request(`https://restaurant-intelligence.local/reports/${reportId}`, {
    headers: new Headers(incomingHeaders)
  });

  return getRequestContext(request);
}

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  try {
    const { reportId } = reportRouteParamsSchema.parse(await params);
    const context = await getPageRequestContext(reportId);
    const report = await getReportDetail(context, reportId);
    const sections = parseStoredReportSections(report.sections);

    if (!sections) {
      return (
        <ReportDetailError
          message="The stored report snapshot is unavailable."
          title="Report snapshot unavailable"
        />
      );
    }

    const locationName = report.location ? formatLocationName(report.location) : null;

    return (
      <main className="min-h-screen bg-canvas text-ink">
        <section className="border-b border-line bg-[#f4f5ed]">
          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <DemoHubLink />
              <Link
                className="inline-flex h-9 w-fit items-center justify-center rounded-md border border-line bg-white px-3 text-xs font-semibold text-muted transition hover:border-pine hover:text-pine focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2"
                href="/reports"
              >
                Back to reports
              </Link>
            </div>
            <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${statusClassName(
                      report.status
                    )}`}
                  >
                    {formatEnum(report.status)}
                  </span>
                  <span className="rounded-md border border-[#9cc7a9] bg-[#edf7ef] px-2.5 py-1 text-xs font-semibold text-positive">
                    Approved insights only
                  </span>
                </div>
                <h1 className="mt-4 max-w-4xl text-3xl font-semibold sm:text-4xl">
                  {report.title}
                </h1>
                <p className="mt-3 max-w-3xl text-base leading-7 text-muted">
                  {report.restaurant.name}
                  {locationName ? ` - ${locationName}` : ""} - {formatDate(report.dateRangeStart)}{" "}
                  to {formatDate(report.dateRangeEnd)}
                </p>
              </div>
              <div className="grid gap-2 text-sm sm:grid-cols-3">
                <MetricCard label="Insights" value={sections.overview.insightCount} />
                <MetricCard label="Sources" value={sections.overview.totalSourceReviews} />
                <MetricCard label="Human review" value={sections.overview.highImpactCount} />
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-8 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="grid content-start gap-4">
            <section className="rounded-lg border border-line bg-white p-4 shadow-soft">
              <h2 className="text-lg font-semibold">Report details</h2>
              <dl className="mt-4 grid gap-3 text-sm">
                <DetailTerm label="Restaurant" value={report.restaurant.name} />
                <DetailTerm label="Location" value={locationName ?? "All locations"} />
                <DetailTerm
                  label="Date range"
                  value={`${formatDate(report.dateRangeStart)} to ${formatDate(report.dateRangeEnd)}`}
                />
                <DetailTerm
                  label="Created by"
                  value={report.createdByUser.name ?? report.createdByUser.email}
                />
                <DetailTerm label="Created" value={formatDateTime(report.createdAt)} />
                <DetailTerm
                  label="Generated"
                  value={report.generatedAt ? formatDateTime(report.generatedAt) : "Not recorded"}
                />
              </dl>
            </section>

            <section className="rounded-lg border border-line bg-white p-4 shadow-soft">
              <h2 className="text-lg font-semibold">Insight sentiment</h2>
              <div className="mt-4 grid gap-2">
                {Object.entries(sections.overview.sentimentCounts).map(([sentiment, count]) => (
                  <div
                    className="flex items-center justify-between rounded-md border border-line bg-snow px-3 py-2 text-sm"
                    key={sentiment}
                  >
                    <span className="font-medium text-muted">{formatEnum(sentiment)}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <section className="grid min-w-0 gap-4">
            <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
              <p className="text-sm font-semibold uppercase text-muted">Snapshot overview</p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight">
                Approved evidence for {report.restaurant.name}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
                This report includes {sections.overview.insightCount} approved insight
                {sections.overview.insightCount === 1 ? "" : "s"} supported by{" "}
                {sections.overview.totalSourceReviews} source review
                {sections.overview.totalSourceReviews === 1 ? "" : "s"}. Draft and rejected
                insights are excluded from the stored snapshot.
              </p>
            </section>

            {sections.insights.length > 0 ? (
              sections.insights.map((insight, index) => (
              <article
                className="rounded-lg border border-line bg-white p-5 shadow-soft"
                key={insight.insightId}
              >
                <div className="flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-md border border-line bg-snow px-2.5 py-1 text-xs font-semibold text-muted">
                        Insight {index + 1}
                      </span>
                      <span
                        className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${sentimentClassName(
                          insight.sentiment
                        )}`}
                      >
                        {formatEnum(insight.sentiment)}
                      </span>
                      <span className="rounded-md border border-[#9cc7a9] bg-[#edf7ef] px-2.5 py-1 text-xs font-semibold text-positive">
                        Approved
                      </span>
                      {insight.highImpact ? (
                        <span className="rounded-md border border-[#ead7a7] bg-[#fff8e8] px-2.5 py-1 text-xs font-semibold text-mixed">
                          Human reviewed
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold leading-tight">{insight.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {formatEnum(insight.type)} - Approved{" "}
                      {insight.approvedAt ? formatDate(insight.approvedAt) : "date not recorded"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 lg:min-w-[360px]">
                    <MetricCard
                      label="Confidence"
                      value={formatConfidence(insight.confidence, insight.confidenceLevel)}
                    />
                    <MetricCard label="Sources" value={insight.sourceReviewCount} />
                    <Link
                      className="inline-flex min-h-16 items-center justify-center rounded-md border border-line bg-snow px-3 py-2 text-center text-sm font-semibold text-ink transition hover:border-pine hover:text-pine focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2"
                      href={`/insights?insightId=${insight.insightId}`}
                    >
                      Open insight
                    </Link>
                  </div>
                </div>

                <div className="py-5">
                  <h3 className="text-sm font-semibold uppercase text-muted">
                    Approved insight summary
                  </h3>
                  <p className="mt-3 max-w-3xl whitespace-pre-wrap text-base leading-7">
                    {insight.summary}
                  </p>
                  {insight.themes.length > 0 ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {insight.themes.map((theme) => (
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

                <section className="border-t border-line pt-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-sm font-semibold uppercase text-muted">Source evidence</h3>
                    <span className="text-sm text-muted">
                      {insight.sourceReviewCount} linked reviews
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {insight.sources.map((source) => (
                      <div className="rounded-md border border-line bg-snow p-4" key={source.reviewId}>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold">
                              {source.title?.trim() || `${formatRating(source.rating)} review`}
                            </p>
                            <p className="mt-1 text-xs text-muted">
                              {formatDate(source.publishedAt)} - {source.locationName} -{" "}
                              {source.sourceName} - {formatEnum(source.sentiment)}
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
              </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-line bg-panel p-8 text-center">
                <h2 className="text-lg font-semibold text-ink">No approved insights stored</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
                  The report snapshot is available, but it does not contain approved insight
                  sections to display.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    );
  } catch (error) {
    return (
      <ReportDetailError
        message={reportDetailErrorMessage(error)}
        title="Report unavailable"
      />
    );
  }
}

function DetailTerm({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-snow px-3 py-2">
      <dt className="font-medium text-muted">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-line bg-white px-3 py-2 text-sm">
      <span className="block text-xs font-semibold uppercase text-muted">{label}</span>
      <span className="mt-1 block font-semibold">{value}</span>
    </div>
  );
}

function formatLocationName(location: {
  city: string | null;
  name: string;
  region: string | null;
}): string {
  return [location.name, location.city, location.region].filter(Boolean).join(", ");
}
