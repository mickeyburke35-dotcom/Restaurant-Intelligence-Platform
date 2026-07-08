import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { ZodError } from "zod";
import {
  CompetitorObservationsWorkspace,
  type CompetitorListItemView,
  type CompetitorLocationOptionView,
  type CompetitorObservationView,
  type CompetitorObservationsWorkspaceData,
  type CompetitorRestaurantOptionView
} from "@/components/competitor-observations-workspace";
import { DemoHubLink } from "@/components/demo-hub-link";
import { ApiError } from "@/lib/api-errors";
import {
  canManageCompetitorObservations,
  getCompetitorObservationPageData,
  parseListCompetitorsSearchParams,
  type CompetitorListItem,
  type CompetitorObservationItem
} from "@/lib/competitors";
import { AccessError, getRequestContext } from "@/lib/request-context";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Competitors | Restaurant Intelligence Platform",
  description: "Tenant-scoped manual competitor observations for restaurant intelligence teams."
};

type CompetitorsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function competitorPageErrorMessage(error: unknown): string {
  if (error instanceof ApiError || error instanceof AccessError) {
    return error.message;
  }

  if (error instanceof ZodError) {
    return "One or more competitor filters are invalid.";
  }

  console.error(error);

  return "The competitors page could not be loaded.";
}

function CompetitorsPageError({
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
        <p className="mt-4 text-sm font-semibold uppercase text-pine">Competitors</p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{title}</h1>
        <p className="mt-4 text-base leading-7 text-muted">{message}</p>
        <Link
          className="mt-8 inline-flex w-fit rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-pine hover:text-pine focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2"
          href="/competitors"
        >
          Reset competitors
        </Link>
      </section>
    </main>
  );
}

async function getPageRequestContext() {
  const incomingHeaders = await headers();
  const request = new Request("https://restaurant-intelligence.local/competitors", {
    headers: new Headers(incomingHeaders)
  });

  return getRequestContext(request);
}

export default async function CompetitorsPage({ searchParams }: CompetitorsPageProps) {
  const resolvedSearchParams = await searchParams;
  let query;

  try {
    query = parseListCompetitorsSearchParams(resolvedSearchParams);
  } catch (error) {
    return (
      <CompetitorsPageError
        message={competitorPageErrorMessage(error)}
        title="Competitor filters need attention"
      />
    );
  }

  try {
    const context = await getPageRequestContext();
    const pageData = await getCompetitorObservationPageData(context, query);

    return (
      <CompetitorObservationsWorkspace
        canManage={canManageCompetitorObservations(context)}
        data={serializeCompetitorObservationPageData(pageData)}
        initialLocationId={query.locationId}
        initialRestaurantId={query.restaurantId}
      />
    );
  } catch (error) {
    return (
      <CompetitorsPageError
        message={competitorPageErrorMessage(error)}
        title="Competitors unavailable"
      />
    );
  }
}

function serializeCompetitorObservationPageData(
  data: Awaited<ReturnType<typeof getCompetitorObservationPageData>>
): CompetitorObservationsWorkspaceData {
  return {
    competitors: data.competitors.map(serializeCompetitor),
    locations: data.locations.map(
      (location): CompetitorLocationOptionView => ({
        city: location.city,
        id: location.id,
        name: location.name,
        region: location.region,
        restaurantId: location.restaurantId
      })
    ),
    restaurants: data.restaurants.map(
      (restaurant): CompetitorRestaurantOptionView => ({
        id: restaurant.id,
        name: restaurant.name,
        segment: restaurant.segment
      })
    )
  };
}

function serializeCompetitor(competitor: CompetitorListItem): CompetitorListItemView {
  return {
    createdAt: competitor.createdAt.toISOString(),
    id: competitor.id,
    locationId: competitor.locationId,
    locationName: competitor.locationName,
    name: competitor.name,
    notes: competitor.notes,
    observations: competitor.observations.map(serializeObservation),
    restaurantId: competitor.restaurantId,
    restaurantName: competitor.restaurantName,
    sourceUrl: competitor.sourceUrl,
    status: competitor.status,
    updatedAt: competitor.updatedAt.toISOString()
  };
}

function serializeObservation(observation: CompetitorObservationItem): CompetitorObservationView {
  return {
    channelSource: observation.channelSource,
    collectedAt: observation.collectedAt.toISOString(),
    createdAt: observation.createdAt.toISOString(),
    evidenceNote: observation.evidenceNote,
    id: observation.id,
    observedAt: observation.observedAt.toISOString(),
    sentiment: observation.sentiment,
    signalType: observation.signalType,
    sourceUrl: observation.sourceUrl,
    summary: observation.summary,
    updatedAt: observation.updatedAt.toISOString()
  };
}
