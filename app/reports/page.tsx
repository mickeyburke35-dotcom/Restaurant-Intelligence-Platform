import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { DemoHubLink } from "@/components/demo-hub-link";
import {
  ReportsWorkspace,
  type ReportListItemView,
  type ReportLocationOptionView,
  type ReportRestaurantOptionView,
  type ReportsWorkspaceData
} from "@/components/reports-workspace";
import { ApiError } from "@/lib/api-errors";
import {
  canManageReports,
  getReportsPageData,
  reportMetricsFromSections,
  type ReportRecord
} from "@/lib/reports";
import { AccessError, getRequestContext } from "@/lib/request-context";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reports | Restaurant Intelligence Platform",
  description: "Tenant-scoped report snapshots from approved AI insights and review evidence."
};

function reportPageErrorMessage(error: unknown): string {
  if (error instanceof ApiError || error instanceof AccessError) {
    return error.message;
  }

  console.error(error);

  return "The reports page could not be loaded.";
}

function ReportsPageError({
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
        <p className="mt-4 text-sm font-semibold uppercase text-pine">Reports</p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{title}</h1>
        <p className="mt-4 text-base leading-7 text-muted">{message}</p>
        <Link
          className="mt-8 inline-flex w-fit rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-pine hover:text-pine focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2"
          href="/reports"
        >
          Reset reports
        </Link>
      </section>
    </main>
  );
}

async function getPageRequestContext() {
  const incomingHeaders = await headers();
  const request = new Request("https://restaurant-intelligence.local/reports", {
    headers: new Headers(incomingHeaders)
  });

  return getRequestContext(request);
}

export default async function ReportsPage() {
  try {
    const context = await getPageRequestContext();
    const pageData = await getReportsPageData(context);

    return (
      <ReportsWorkspace
        canManage={canManageReports(context)}
        data={serializeReportsPageData(pageData)}
      />
    );
  } catch (error) {
    return (
      <ReportsPageError
        message={reportPageErrorMessage(error)}
        title="Reports unavailable"
      />
    );
  }
}

function serializeReportsPageData(data: Awaited<ReturnType<typeof getReportsPageData>>): ReportsWorkspaceData {
  return {
    defaultDateRange: data.defaultDateRange,
    locations: data.locations.map(
      (location): ReportLocationOptionView => ({
        city: location.city,
        id: location.id,
        name: location.name,
        region: location.region,
        restaurantId: location.restaurantId
      })
    ),
    reports: data.reports.map(serializeReport),
    restaurants: data.restaurants.map(
      (restaurant): ReportRestaurantOptionView => ({
        id: restaurant.id,
        name: restaurant.name,
        segment: restaurant.segment
      })
    )
  };
}

function serializeReport(report: ReportRecord): ReportListItemView {
  const metrics = reportMetricsFromSections(report.sections);

  return {
    createdAt: report.createdAt.toISOString(),
    createdBy: report.createdByUser.name ?? report.createdByUser.email,
    dateRangeEnd: report.dateRangeEnd.toISOString(),
    dateRangeStart: report.dateRangeStart.toISOString(),
    generatedAt: report.generatedAt?.toISOString() ?? null,
    id: report.id,
    insightCount: metrics.insightCount,
    locationName: report.location ? formatLocationName(report.location) : null,
    restaurantName: report.restaurant.name,
    sourceReviewCount: metrics.sourceReviewCount,
    status: report.status,
    title: report.title
  };
}

function formatLocationName(location: {
  city: string | null;
  name: string;
  region: string | null;
}): string {
  return [location.name, location.city, location.region].filter(Boolean).join(", ");
}
