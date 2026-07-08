"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DemoHubLink } from "@/components/demo-hub-link";

export type ReportRestaurantOptionView = {
  id: string;
  name: string;
  segment: string | null;
};

export type ReportLocationOptionView = {
  city: string | null;
  id: string;
  name: string;
  region: string | null;
  restaurantId: string;
};

export type ReportListItemView = {
  createdAt: string;
  createdBy: string;
  dateRangeEnd: string;
  dateRangeStart: string;
  generatedAt: string | null;
  id: string;
  insightCount: number;
  locationName: string | null;
  restaurantName: string;
  sourceReviewCount: number;
  status: string;
  title: string;
};

export type ReportsWorkspaceData = {
  defaultDateRange: {
    dateRangeEnd: string;
    dateRangeStart: string;
  };
  locations: ReportLocationOptionView[];
  reports: ReportListItemView[];
  restaurants: ReportRestaurantOptionView[];
};

type ReportsWorkspaceProps = {
  canManage: boolean;
  data: ReportsWorkspaceData;
};

type ApiErrorPayload = {
  data?: {
    id?: string;
  };
  error?:
    | string
    | {
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

function formatLocationName(location: ReportLocationOptionView): string {
  return [location.name, location.city, location.region].filter(Boolean).join(", ");
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

export function ReportsWorkspace({ canManage, data }: ReportsWorkspaceProps) {
  const router = useRouter();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(data.restaurants[0]?.id ?? "");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [dateRangeStart, setDateRangeStart] = useState(data.defaultDateRange.dateRangeStart);
  const [dateRangeEnd, setDateRangeEnd] = useState(data.defaultDateRange.dateRangeEnd);
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; text: string } | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);

  const visibleLocations = useMemo(
    () => data.locations.filter((location) => location.restaurantId === selectedRestaurantId),
    [data.locations, selectedRestaurantId]
  );
  const totalInsights = data.reports.reduce((sum, report) => sum + report.insightCount, 0);
  const totalSources = data.reports.reduce((sum, report) => sum + report.sourceReviewCount, 0);

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!selectedRestaurantId || !dateRangeStart || !dateRangeEnd) {
      setFeedback({
        tone: "error",
        text: "Choose a restaurant and both date fields before creating a report."
      });
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("/api/reports", {
        body: JSON.stringify({
          dateRangeEnd,
          dateRangeStart,
          locationId: selectedLocationId || null,
          restaurantId: selectedRestaurantId
        }),
        headers: {
          "content-type": "application/json"
        },
        method: "POST"
      });
      const payload = (await response.json()) as ApiErrorPayload;

      if (!response.ok) {
        throw new Error(apiErrorMessage(payload, "Report could not be created."));
      }

      if (!payload.data?.id) {
        throw new Error("Report was created, but the detail link was not returned.");
      }

      setFeedback({ tone: "success", text: "Report created." });
      router.push(`/reports/${payload.data.id}`);
      router.refresh();
    } catch (error) {
      setFeedback({
        tone: "error",
        text: error instanceof Error ? error.message : "Report could not be created."
      });
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <section className="border-b border-line bg-[#f4f5ed]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <DemoHubLink />
          <p className="mt-4 text-sm font-semibold uppercase text-pine">Reports</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold sm:text-4xl">Approved Insight Reports</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted">
                Create tenant-scoped report snapshots from approved insights and linked public
                review evidence.
              </p>
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-3">
              <div className="rounded-md border border-line bg-white px-4 py-3">
                <span className="block text-xs font-semibold uppercase text-muted">Reports</span>
                <span className="mt-1 block text-xl font-semibold">{data.reports.length}</span>
              </div>
              <div className="rounded-md border border-[#b9d4c1] bg-[#edf7ef] px-4 py-3">
                <span className="block text-xs font-semibold uppercase text-muted">Insights</span>
                <span className="mt-1 block text-xl font-semibold text-positive">
                  {totalInsights}
                </span>
              </div>
              <div className="rounded-md border border-line bg-white px-4 py-3">
                <span className="block text-xs font-semibold uppercase text-muted">Sources</span>
                <span className="mt-1 block text-xl font-semibold">{totalSources}</span>
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
              onSubmit={submitReport}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Create report</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">Approved insights only</p>
                </div>
                <span className="rounded-md border border-[#9cc7a9] bg-[#edf7ef] px-2 py-1 text-xs font-semibold text-positive">
                  APPROVED
                </span>
              </div>

              <div className="mt-5 grid gap-4">
                <label className="grid gap-2 text-sm font-medium text-muted">
                  Restaurant
                  <select
                    className="h-11 rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                    disabled={data.restaurants.length === 0}
                    onChange={(event) => {
                      setSelectedRestaurantId(event.target.value);
                      setSelectedLocationId("");
                    }}
                    value={selectedRestaurantId}
                  >
                    {data.restaurants.length === 0 ? (
                      <option value="">No restaurants available</option>
                    ) : null}
                    {data.restaurants.map((restaurant) => (
                      <option key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </option>
                    ))}
                  </select>
                </label>
                {data.restaurants.length === 0 ? (
                  <div className="rounded-md border border-line bg-snow px-3 py-3 text-sm leading-6 text-muted">
                    Add a restaurant client before creating approved insight reports.
                  </div>
                ) : null}

                <label className="grid gap-2 text-sm font-medium text-muted">
                  Location
                  <select
                    className="h-11 rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                    onChange={(event) => setSelectedLocationId(event.target.value)}
                    value={selectedLocationId}
                  >
                    <option value="">All locations</option>
                    {visibleLocations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {formatLocationName(location)}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-muted">
                    Start date
                    <input
                      className="h-11 rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                      onChange={(event) => setDateRangeStart(event.target.value)}
                      type="date"
                      value={dateRangeStart}
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-muted">
                    End date
                    <input
                      className="h-11 rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                      onChange={(event) => setDateRangeEnd(event.target.value)}
                      type="date"
                      value={dateRangeEnd}
                    />
                  </label>
                </div>
              </div>

              <button
                aria-busy={isCreating}
                className="mt-4 h-10 w-full rounded-md bg-pine px-4 text-sm font-semibold text-white transition hover:bg-pine-dark disabled:cursor-not-allowed disabled:bg-[#9bb4ad]"
                disabled={isCreating || !selectedRestaurantId || !dateRangeStart || !dateRangeEnd}
                type="submit"
              >
                {isCreating ? "Creating report..." : "Create report"}
              </button>
            </form>
          ) : (
            <div className="rounded-lg border border-line bg-white p-4 text-sm leading-6 text-muted shadow-soft">
              Viewer access can open report details but cannot create new report snapshots.
            </div>
          )}

          {feedback ? (
            <div
              className={`rounded-md border px-4 py-3 text-sm ${
                feedback.tone === "success"
                  ? "border-[#b9d4c1] bg-[#edf7ef] text-positive"
                  : "border-[#e7bbb8] bg-[#fff1ef] text-negative"
              }`}
              role={feedback.tone === "error" ? "alert" : "status"}
            >
              {feedback.text}
            </div>
          ) : null}
        </aside>

        <section className="min-w-0">
          <div className="overflow-hidden rounded-lg border border-line bg-white shadow-soft">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-lg font-semibold">Stored reports</h2>
              <p className="mt-1 text-sm text-muted">Draft and rejected insights are excluded.</p>
            </div>

            {data.reports.length > 0 ? (
              <div className="divide-y divide-[#e7ebe4]">
                {data.reports.map((report) => (
                  <article
                    className="grid gap-4 px-5 py-5 transition hover:bg-[#f7f8f1] lg:grid-cols-[minmax(0,1fr)_auto]"
                    key={report.id}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${statusClassName(
                            report.status
                          )}`}
                        >
                          {formatEnum(report.status)}
                        </span>
                        <span className="rounded-md border border-[#9cc7a9] bg-[#edf7ef] px-2.5 py-1 text-xs font-semibold text-positive">
                          Approved only
                        </span>
                      </div>
                      <h3 className="mt-3 text-xl font-semibold leading-tight">{report.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {report.restaurantName}
                        {report.locationName ? ` - ${report.locationName}` : ""} -{" "}
                        {formatDate(report.dateRangeStart)} to {formatDate(report.dateRangeEnd)}
                      </p>
                      <p className="mt-2 text-sm text-muted">
                        Created by {report.createdBy} on {formatDateTime(report.createdAt)}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[120px_120px_auto] lg:items-center">
                      <div className="rounded-md border border-line bg-snow px-3 py-2 text-sm">
                        <span className="block text-xs font-semibold uppercase text-muted">
                          Insights
                        </span>
                        <span className="mt-1 block font-semibold">{report.insightCount}</span>
                      </div>
                      <div className="rounded-md border border-line bg-snow px-3 py-2 text-sm">
                        <span className="block text-xs font-semibold uppercase text-muted">
                          Sources
                        </span>
                        <span className="mt-1 block font-semibold">{report.sourceReviewCount}</span>
                      </div>
                      <Link
                        className="inline-flex h-10 items-center justify-center rounded-md border border-line px-4 text-sm font-semibold text-ink transition hover:border-pine hover:text-pine focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2"
                        href={`/reports/${report.id}`}
                      >
                        View report
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="px-5 py-14 text-center">
                <h3 className="text-lg font-semibold text-ink">No report snapshots yet</h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
                  Reports are created from approved AI insights only. Approve at least one
                  evidence-linked insight for a restaurant, then return here to create a snapshot.
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    className="inline-flex h-10 w-full items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-pine hover:text-pine focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2 sm:w-fit"
                    href="/insights"
                  >
                    Open insight review
                  </Link>
                  {canManage ? (
                    <Link
                      className="inline-flex h-10 w-full items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-pine hover:text-pine focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2 sm:w-fit"
                      href="/reviews"
                    >
                      Check review data
                    </Link>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
