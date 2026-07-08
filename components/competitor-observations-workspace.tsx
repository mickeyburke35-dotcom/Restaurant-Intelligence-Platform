"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DemoHubLink } from "@/components/demo-hub-link";

export type CompetitorRestaurantOptionView = {
  id: string;
  name: string;
  segment: string | null;
};

export type CompetitorLocationOptionView = {
  city: string | null;
  id: string;
  name: string;
  region: string | null;
  restaurantId: string;
};

export type CompetitorObservationView = {
  channelSource: string | null;
  collectedAt: string;
  createdAt: string;
  evidenceNote: string | null;
  id: string;
  observedAt: string;
  sentiment: string;
  signalType: string;
  sourceUrl: string | null;
  summary: string;
  updatedAt: string;
};

export type CompetitorListItemView = {
  createdAt: string;
  id: string;
  locationId: string | null;
  locationName: string | null;
  name: string;
  notes: string | null;
  observations: CompetitorObservationView[];
  restaurantId: string;
  restaurantName: string;
  sourceUrl: string | null;
  status: string;
  updatedAt: string;
};

export type CompetitorObservationsWorkspaceData = {
  competitors: CompetitorListItemView[];
  locations: CompetitorLocationOptionView[];
  restaurants: CompetitorRestaurantOptionView[];
};

type CompetitorObservationsWorkspaceProps = {
  canManage: boolean;
  data: CompetitorObservationsWorkspaceData;
  initialLocationId?: string;
  initialRestaurantId?: string;
};

type ApiErrorPayload = {
  error?: string | {
    message?: string;
  };
};

const sentimentOptions = ["UNKNOWN", "POSITIVE", "NEUTRAL", "MIXED", "NEGATIVE"] as const;

const signalTypeOptions = [
  "MARKET_NOTE",
  "REVIEW_THEME",
  "RATING_SNAPSHOT",
  "REVIEW_VOLUME",
  "MENU_CHANGE",
  "PRICING_SIGNAL",
  "PROMOTION",
  "HOURS_CHANGE",
  "OTHER"
] as const;

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

function dateInputToday(): string {
  return new Date().toISOString().slice(0, 10);
}

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

function formatLocationName(location: CompetitorLocationOptionView): string {
  return [location.name, location.city, location.region].filter(Boolean).join(", ");
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

function latestObservationDate(competitors: CompetitorListItemView[]): string | null {
  let latest: string | null = null;

  for (const competitor of competitors) {
    for (const observation of competitor.observations) {
      if (!latest || observation.observedAt > latest) {
        latest = observation.observedAt;
      }
    }
  }

  return latest;
}

export function CompetitorObservationsWorkspace({
  canManage,
  data,
  initialLocationId,
  initialRestaurantId
}: CompetitorObservationsWorkspaceProps) {
  const router = useRouter();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(
    initialRestaurantId ?? data.restaurants[0]?.id ?? ""
  );
  const [selectedLocationId, setSelectedLocationId] = useState(initialLocationId ?? "");
  const [selectedCompetitorId, setSelectedCompetitorId] = useState(data.competitors[0]?.id ?? "");
  const [observedAt, setObservedAt] = useState(dateInputToday());
  const [channelSource, setChannelSource] = useState("");
  const [sentiment, setSentiment] = useState<(typeof sentimentOptions)[number]>("UNKNOWN");
  const [signalType, setSignalType] = useState<(typeof signalTypeOptions)[number]>("MARKET_NOTE");
  const [sourceUrl, setSourceUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [evidenceNote, setEvidenceNote] = useState("");
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; text: string } | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);

  const visibleLocations = useMemo(
    () => data.locations.filter((location) => location.restaurantId === selectedRestaurantId),
    [data.locations, selectedRestaurantId]
  );
  const visibleCompetitors = useMemo(
    () =>
      data.competitors.filter((competitor) => {
        if (selectedRestaurantId && competitor.restaurantId !== selectedRestaurantId) {
          return false;
        }

        return selectedLocationId ? competitor.locationId === selectedLocationId : true;
      }),
    [data.competitors, selectedLocationId, selectedRestaurantId]
  );
  const selectedCompetitor =
    visibleCompetitors.find((competitor) => competitor.id === selectedCompetitorId) ??
    visibleCompetitors[0] ??
    null;
  const observationCount = data.competitors.reduce(
    (sum, competitor) => sum + competitor.observations.length,
    0
  );
  const latestObservedAt = latestObservationDate(data.competitors);

  useEffect(() => {
    if (visibleCompetitors.length === 0) {
      setSelectedCompetitorId("");
      return;
    }

    if (!visibleCompetitors.some((competitor) => competitor.id === selectedCompetitorId)) {
      setSelectedCompetitorId(visibleCompetitors[0].id);
    }
  }, [selectedCompetitorId, visibleCompetitors]);

  async function submitObservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!selectedCompetitor?.id) {
      setFeedback({ tone: "error", text: "Select a competitor before saving an observation." });
      return;
    }

    if (!observedAt || !channelSource || !summary || !evidenceNote) {
      setFeedback({
        tone: "error",
        text: "Observation date, channel/source, summary, and evidence note are required."
      });
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch(`/api/competitors/${selectedCompetitor.id}/observations`, {
        body: JSON.stringify({
          channelSource,
          evidenceNote,
          observedAt,
          sentiment,
          signalType,
          sourceUrl: sourceUrl || null,
          summary
        }),
        headers: {
          "content-type": "application/json"
        },
        method: "POST"
      });
      const payload = (await response.json()) as ApiErrorPayload;

      if (!response.ok) {
        throw new Error(apiErrorMessage(payload, "Competitor observation could not be saved."));
      }

      setFeedback({ tone: "success", text: "Competitor observation saved." });
      setChannelSource("");
      setSentiment("UNKNOWN");
      setSignalType("MARKET_NOTE");
      setSourceUrl("");
      setSummary("");
      setEvidenceNote("");
      router.refresh();
    } catch (error) {
      setFeedback({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Competitor observation could not be saved."
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
          <p className="mt-4 text-sm font-semibold uppercase text-pine">Competitors</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold sm:text-4xl">Competitor Observations</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted">
                Track manually entered competitor notes with source context, sentiment, and evidence.
              </p>
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-3">
              <div className="rounded-md border border-line bg-white px-4 py-3">
                <span className="block text-xs font-semibold uppercase text-muted">
                  Competitors
                </span>
                <span className="mt-1 block text-xl font-semibold">{data.competitors.length}</span>
              </div>
              <div className="rounded-md border border-line bg-white px-4 py-3">
                <span className="block text-xs font-semibold uppercase text-muted">
                  Observations
                </span>
                <span className="mt-1 block text-xl font-semibold">{observationCount}</span>
              </div>
              <div className="rounded-md border border-[#b9d4c1] bg-[#edf7ef] px-4 py-3">
                <span className="block text-xs font-semibold uppercase text-muted">Latest</span>
                <span className="mt-1 block text-xl font-semibold text-positive">
                  {latestObservedAt ? formatDate(latestObservedAt) : "None"}
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
              onSubmit={submitObservation}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Add observation</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {selectedCompetitor?.name ?? "Select a competitor"}
                  </p>
                </div>
                <span className="rounded-md border border-line bg-snow px-2 py-1 text-xs font-semibold text-muted">
                  MANUAL
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

                <label className="grid gap-2 text-sm font-medium text-muted">
                  Competitor
                  <select
                    className="h-11 rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                    disabled={visibleCompetitors.length === 0}
                    onChange={(event) => setSelectedCompetitorId(event.target.value)}
                    value={selectedCompetitor?.id ?? ""}
                  >
                    {visibleCompetitors.length === 0 ? (
                      <option value="">No competitors available</option>
                    ) : null}
                    {visibleCompetitors.map((competitor) => (
                      <option key={competitor.id} value={competitor.id}>
                        {competitor.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-medium text-muted">
                  Observation date
                  <input
                    className="h-11 rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                    onChange={(event) => setObservedAt(event.target.value)}
                    type="date"
                    value={observedAt}
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-muted">
                  Channel/source
                  <input
                    className="h-11 rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                    maxLength={160}
                    onChange={(event) => setChannelSource(event.target.value)}
                    value={channelSource}
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-muted">
                    Sentiment
                    <select
                      className="h-11 rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                      onChange={(event) =>
                        setSentiment(event.target.value as (typeof sentimentOptions)[number])
                      }
                      value={sentiment}
                    >
                      {sentimentOptions.map((option) => (
                        <option key={option} value={option}>
                          {formatEnum(option)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-muted">
                    Type
                    <select
                      className="h-11 rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                      onChange={(event) =>
                        setSignalType(event.target.value as (typeof signalTypeOptions)[number])
                      }
                      value={signalType}
                    >
                      {signalTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {formatEnum(option)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="grid gap-2 text-sm font-medium text-muted">
                  Source URL
                  <input
                    className="h-11 rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                    inputMode="url"
                    maxLength={2048}
                    onChange={(event) => setSourceUrl(event.target.value)}
                    type="url"
                    value={sourceUrl}
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-muted">
                  Summary
                  <textarea
                    className="min-h-24 rounded-md border border-line bg-snow px-3 py-2 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                    maxLength={2000}
                    onChange={(event) => setSummary(event.target.value)}
                    value={summary}
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-muted">
                  Evidence note
                  <textarea
                    className="min-h-24 rounded-md border border-line bg-snow px-3 py-2 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                    maxLength={2000}
                    onChange={(event) => setEvidenceNote(event.target.value)}
                    value={evidenceNote}
                  />
                </label>
              </div>

              <button
                className="mt-4 h-10 w-full rounded-md bg-pine px-4 text-sm font-semibold text-white transition hover:bg-pine-dark disabled:cursor-not-allowed disabled:bg-[#9bb4ad]"
                disabled={
                  isCreating ||
                  !selectedCompetitor ||
                  !observedAt ||
                  !channelSource ||
                  !summary ||
                  !evidenceNote
                }
                type="submit"
              >
                {isCreating ? "Saving observation" : "Save observation"}
              </button>
            </form>
          ) : (
            <div className="rounded-lg border border-line bg-white p-4 text-sm leading-6 text-muted shadow-soft">
              Viewer access can inspect competitor observations but cannot create new entries.
            </div>
          )}

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
              <h2 className="text-lg font-semibold">Competitor list</h2>
              <p className="mt-1 text-sm text-muted">{visibleCompetitors.length} in selection</p>
            </div>
            {visibleCompetitors.length > 0 ? (
              <div className="divide-y divide-[#e7ebe4]">
                {visibleCompetitors.map((competitor) => (
                  <button
                    className={`w-full px-4 py-4 text-left transition hover:bg-[#f7f8f1] ${
                      selectedCompetitor?.id === competitor.id ? "bg-[#eef6f2]" : "bg-white"
                    }`}
                    key={competitor.id}
                    onClick={() => setSelectedCompetitorId(competitor.id)}
                    type="button"
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">
                          {competitor.name}
                        </span>
                        <span className="mt-1 block text-xs text-muted">
                          {competitor.restaurantName}
                          {competitor.locationName ? ` - ${competitor.locationName}` : ""}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-md border border-line bg-snow px-2 py-1 text-[11px] font-semibold text-muted">
                        {competitor.observations.length}
                      </span>
                    </span>
                    <span className="mt-3 block text-sm leading-5 text-muted">
                      {competitor.notes?.trim() || "No competitor notes recorded."}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-5 py-10 text-center text-sm leading-6 text-muted">
                No competitors are available for this selection.
              </div>
            )}
          </section>
        </aside>

        <section className="min-w-0">
          {selectedCompetitor ? (
            <article className="rounded-lg border border-line bg-white p-5 shadow-soft">
              <div className="flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-md border border-[#b9d4c1] bg-[#edf7ef] px-2.5 py-1 text-xs font-semibold text-positive">
                      {formatEnum(selectedCompetitor.status)}
                    </span>
                    <span className="rounded-md border border-line bg-snow px-2.5 py-1 text-xs font-semibold text-muted">
                      {selectedCompetitor.observations.length} observations
                    </span>
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold leading-tight">
                    {selectedCompetitor.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {selectedCompetitor.restaurantName}
                    {selectedCompetitor.locationName
                      ? ` - ${selectedCompetitor.locationName}`
                      : ""}
                  </p>
                </div>
                <div className="grid gap-2 text-sm sm:grid-cols-2 lg:min-w-[360px]">
                  <div className="rounded-md border border-line bg-snow px-3 py-2">
                    <span className="block text-xs font-semibold uppercase text-muted">
                      Updated
                    </span>
                    <span className="mt-1 block font-semibold">
                      {formatDateTime(selectedCompetitor.updatedAt)}
                    </span>
                  </div>
                  <div className="rounded-md border border-line bg-snow px-3 py-2">
                    <span className="block text-xs font-semibold uppercase text-muted">
                      Source
                    </span>
                    {selectedCompetitor.sourceUrl ? (
                      <a
                        className="mt-1 block truncate font-semibold text-pine underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2"
                        href={selectedCompetitor.sourceUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open source
                      </a>
                    ) : (
                      <span className="mt-1 block font-semibold">Not recorded</span>
                    )}
                  </div>
                </div>
              </div>

              <section className="py-5">
                <h3 className="text-sm font-semibold uppercase text-muted">Observation log</h3>
                {selectedCompetitor.observations.length > 0 ? (
                  <div className="mt-4 grid gap-3">
                    {selectedCompetitor.observations.map((observation) => (
                      <div
                        className="rounded-md border border-line bg-[#fbfaf7] p-4"
                        key={observation.id}
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-md border border-line bg-white px-2.5 py-1 text-xs font-semibold text-muted">
                                {formatDate(observation.observedAt)}
                              </span>
                              <span
                                className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${sentimentClassName(
                                  observation.sentiment
                                )}`}
                              >
                                {formatEnum(observation.sentiment)}
                              </span>
                              <span className="rounded-md border border-line bg-white px-2.5 py-1 text-xs font-semibold text-muted">
                                {formatEnum(observation.signalType)}
                              </span>
                            </div>
                            <p className="mt-3 text-base font-semibold leading-7">
                              {observation.summary}
                            </p>
                          </div>
                          {observation.sourceUrl ? (
                            <a
                              className="text-sm font-semibold text-pine underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2"
                              href={observation.sourceUrl}
                              rel="noreferrer"
                              target="_blank"
                            >
                              Source URL
                            </a>
                          ) : null}
                        </div>

                        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                          <div className="rounded-md border border-line bg-white px-3 py-2">
                            <dt className="font-medium text-muted">Channel/source</dt>
                            <dd className="mt-1 font-semibold">
                              {observation.channelSource ?? "Not recorded"}
                            </dd>
                          </div>
                          <div className="rounded-md border border-line bg-white px-3 py-2">
                            <dt className="font-medium text-muted">Logged</dt>
                            <dd className="mt-1 font-semibold">
                              {formatDateTime(observation.createdAt)}
                            </dd>
                          </div>
                        </dl>
                        <div className="mt-3 rounded-md border border-line bg-white px-3 py-3 text-sm">
                          <p className="font-medium text-muted">Evidence note</p>
                          <p className="mt-2 leading-6 text-ink">
                            {observation.evidenceNote ?? "No evidence note recorded."}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 flex min-h-[320px] items-center justify-center rounded-md border border-dashed border-line bg-panel p-8 text-center text-sm leading-6 text-muted">
                    No observations have been entered for this competitor.
                  </div>
                )}
              </section>
            </article>
          ) : (
            <div className="flex min-h-[520px] items-center justify-center rounded-lg border border-dashed border-line bg-panel p-8 text-center text-sm leading-6 text-muted">
              No competitors are available for this agency.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
