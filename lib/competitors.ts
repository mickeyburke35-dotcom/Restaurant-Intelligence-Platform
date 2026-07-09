import {
  AuditEntityType,
  CompetitorObservationType,
  CompetitorStatus,
  MembershipRole,
  Prisma,
  Sentiment
} from "@prisma/client";
import { z } from "zod";
import { badRequest, notFound } from "@/lib/api-errors";
import { prisma } from "@/lib/prisma";
import { AccessError, type RequestContext } from "@/lib/request-context";

const competitorObservationRoles = new Set<MembershipRole>([
  MembershipRole.OWNER,
  MembershipRole.ADMIN,
  MembershipRole.MANAGER,
  MembershipRole.ANALYST
]);

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
const sentimentValues = new Set<Sentiment>(Object.values(Sentiment));

const emptyToUndefined = (value: unknown) => {
  if (value === "") {
    return undefined;
  }

  return value;
};

const emptyToNull = (value: unknown) => {
  if (value === "") {
    return null;
  }

  return value;
};

const normalizeDateInput = (value: unknown) =>
  typeof value === "string" ? value.trim() : value;

const optionalUuidSchema = z.preprocess(emptyToUndefined, z.string().uuid().optional());

const requiredDateOnlySchema = z.preprocess(
  normalizeDateInput,
  z
    .string()
    .regex(dateOnlyPattern, "Date must use YYYY-MM-DD format.")
    .refine(isValidDateOnly, "Date must be a valid calendar date.")
);

const optionalSourceUrlSchema = z.preprocess(
  emptyToNull,
  z.string().trim().url().max(2048).nullable().optional()
);

export const listCompetitorsQuerySchema = z.object({
  includeArchived: z
    .enum(["true", "false"])
    .optional()
    .default("false")
    .transform((value) => value === "true"),
  locationId: optionalUuidSchema,
  restaurantId: optionalUuidSchema
});

export const competitorRouteParamsSchema = z.object({
  competitorId: z.string().uuid()
});

export const createCompetitorObservationSchema = z
  .object({
    channelSource: z.string().trim().min(1).max(160),
    evidenceNote: z.string().trim().min(1).max(2000),
    observedAt: requiredDateOnlySchema,
    sentiment: z.nativeEnum(Sentiment),
    signalType: z
      .nativeEnum(CompetitorObservationType)
      .optional()
      .default(CompetitorObservationType.MARKET_NOTE),
    sourceUrl: optionalSourceUrlSchema,
    summary: z.string().trim().min(1).max(2000)
  })
  .strict();

export type ListCompetitorsQuery = z.infer<typeof listCompetitorsQuerySchema>;
export type CreateCompetitorObservationRequest = z.infer<
  typeof createCompetitorObservationSchema
>;

const restaurantOptionSelect = {
  id: true,
  name: true,
  segment: true
} satisfies Prisma.RestaurantSelect;

const locationOptionSelect = {
  city: true,
  id: true,
  name: true,
  region: true,
  restaurantId: true
} satisfies Prisma.LocationSelect;

const observationSelect = {
  collectedAt: true,
  createdAt: true,
  id: true,
  metadata: true,
  observedAt: true,
  signalType: true,
  sourceUrl: true,
  updatedAt: true,
  value: true
} satisfies Prisma.CompetitorObservationSelect;

const competitorSelect = {
  createdAt: true,
  id: true,
  location: {
    select: {
      city: true,
      id: true,
      name: true,
      region: true
    }
  },
  locationId: true,
  name: true,
  notes: true,
  observations: {
    orderBy: [{ observedAt: "desc" }, { createdAt: "desc" }],
    select: observationSelect,
    take: 12,
    where: {
      deletedAt: null
    }
  },
  restaurant: {
    select: restaurantOptionSelect
  },
  restaurantId: true,
  sourceUrl: true,
  status: true,
  updatedAt: true
} satisfies Prisma.CompetitorSelect;

export type CompetitorRestaurantOption = Prisma.RestaurantGetPayload<{
  select: typeof restaurantOptionSelect;
}>;
export type CompetitorLocationOption = Prisma.LocationGetPayload<{
  select: typeof locationOptionSelect;
}>;

type CompetitorRecord = Prisma.CompetitorGetPayload<{ select: typeof competitorSelect }>;
type ObservationRecord = Prisma.CompetitorObservationGetPayload<{
  select: typeof observationSelect;
}>;

export type CompetitorObservationItem = {
  channelSource: string | null;
  collectedAt: Date;
  createdAt: Date;
  evidenceNote: string | null;
  id: string;
  observedAt: Date;
  sentiment: Sentiment;
  signalType: CompetitorObservationType;
  sourceUrl: string | null;
  summary: string;
  updatedAt: Date;
};

export type CompetitorListItem = {
  createdAt: Date;
  id: string;
  locationId: string | null;
  locationName: string | null;
  name: string;
  notes: string | null;
  observations: CompetitorObservationItem[];
  restaurantId: string;
  restaurantName: string;
  sourceUrl: string | null;
  status: CompetitorStatus;
  updatedAt: Date;
};

export type CompetitorObservationPageData = {
  competitors: CompetitorListItem[];
  locations: CompetitorLocationOption[];
  query: ListCompetitorsQuery;
  restaurants: CompetitorRestaurantOption[];
};

export function canManageCompetitorObservations(context: RequestContext): boolean {
  return competitorObservationRoles.has(context.role);
}

export function assertCanManageCompetitorObservations(context: RequestContext): void {
  if (!canManageCompetitorObservations(context)) {
    throw new AccessError("Your role cannot create competitor observations for this agency.", 403);
  }
}

function isValidDateOnly(value: string): boolean {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function dateOnlyToUtc(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

function searchParamRecordToObject(
  searchParams: Record<string, string | string[] | undefined>
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      if (value[0] !== undefined) {
        result[key] = value[0];
      }
    } else if (value !== undefined) {
      result[key] = value;
    }
  }

  return result;
}

function searchParamsToObject(searchParams: URLSearchParams): Record<string, string> {
  return Object.fromEntries(searchParams.entries());
}

export function parseListCompetitorsSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): ListCompetitorsQuery {
  return listCompetitorsQuerySchema.parse(searchParamRecordToObject(searchParams));
}

export function parseListCompetitorsQuery(searchParams: URLSearchParams): ListCompetitorsQuery {
  return listCompetitorsQuerySchema.parse(searchParamsToObject(searchParams));
}

export async function getCompetitorObservationPageData(
  context: RequestContext,
  query: ListCompetitorsQuery
): Promise<CompetitorObservationPageData> {
  const scope = await resolveCompetitorScope(context, query);
  const restaurantScope = context.restaurantId ? { id: context.restaurantId } : {};
  const [competitors, restaurants, locations] = await prisma.$transaction([
    prisma.competitor.findMany({
      orderBy: [{ name: "asc" }, { createdAt: "desc" }],
      select: competitorSelect,
      where: competitorWhere(context, scope)
    }),
    prisma.restaurant.findMany({
      orderBy: [{ name: "asc" }, { createdAt: "desc" }],
      select: restaurantOptionSelect,
      where: {
        agencyId: context.agencyId,
        deletedAt: null,
        ...restaurantScope
      }
    }),
    prisma.location.findMany({
      orderBy: [{ name: "asc" }, { createdAt: "desc" }],
      select: locationOptionSelect,
      where: {
        agencyId: context.agencyId,
        deletedAt: null,
        ...(scope.restaurantId ? { restaurantId: scope.restaurantId } : restaurantScope)
      }
    })
  ]);

  return {
    competitors: competitors.map(toCompetitorListItem),
    locations,
    query,
    restaurants
  };
}

export async function listCompetitors(
  context: RequestContext,
  query: ListCompetitorsQuery
): Promise<CompetitorListItem[]> {
  const scope = await resolveCompetitorScope(context, query);
  const competitors = await prisma.competitor.findMany({
    orderBy: [{ name: "asc" }, { createdAt: "desc" }],
    select: competitorSelect,
    where: competitorWhere(context, scope)
  });

  return competitors.map(toCompetitorListItem);
}

export async function createCompetitorObservation(
  context: RequestContext,
  competitorId: string,
  input: CreateCompetitorObservationRequest
): Promise<CompetitorObservationItem> {
  assertCanManageCompetitorObservations(context);

  const competitor = await prisma.competitor.findFirst({
    select: {
      id: true,
      locationId: true,
      restaurantId: true
    },
    where: {
      agencyId: context.agencyId,
      deletedAt: null,
      id: competitorId,
      status: CompetitorStatus.ACTIVE,
      ...(context.restaurantId ? { restaurantId: context.restaurantId } : {})
    }
  });

  if (!competitor) {
    throw notFound("Competitor not found.");
  }

  const observedAt = dateOnlyToUtc(input.observedAt);
  const metadata: Prisma.InputJsonObject = {
    channelSource: input.channelSource,
    entryMode: "manual",
    evidenceNote: input.evidenceNote,
    sentiment: input.sentiment,
    version: 1
  };

  return prisma.$transaction(async (tx) => {
    const observation = await tx.competitorObservation.create({
      data: {
        agencyId: context.agencyId,
        competitorId: competitor.id,
        metadata,
        observedAt,
        signalType: input.signalType,
        sourceUrl: input.sourceUrl ?? null,
        value: input.summary
      },
      select: observationSelect
    });

    await tx.auditLog.create({
      data: {
        action: "competitor_observation_created",
        agencyId: context.agencyId,
        entityId: observation.id,
        entityType: AuditEntityType.COMPETITOR_OBSERVATION,
        metadata: {
          channelSource: input.channelSource,
          competitorId: competitor.id,
          entryMode: "manual",
          locationId: competitor.locationId,
          observedAt: observedAt.toISOString(),
          restaurantId: competitor.restaurantId,
          sentiment: input.sentiment,
          signalType: input.signalType,
          sourceUrl: input.sourceUrl ?? null
        },
        userId: context.userId
      }
    });

    return toCompetitorObservationItem(observation);
  });
}

async function resolveCompetitorScope(
  context: RequestContext,
  query: ListCompetitorsQuery
): Promise<{
  includeArchived: boolean;
  locationId: string | undefined;
  restaurantId: string | undefined;
}> {
  const restaurantId = context.restaurantId ?? query.restaurantId;

  if (restaurantId) {
    const restaurant = await prisma.restaurant.findFirst({
      select: {
        id: true
      },
      where: {
        agencyId: context.agencyId,
        deletedAt: null,
        id: restaurantId,
        ...(context.restaurantId ? { id: context.restaurantId } : {})
      }
    });

    if (!restaurant) {
      throw notFound("Restaurant not found.");
    }
  }

  if (query.locationId) {
    const location = await prisma.location.findFirst({
      select: {
        id: true
      },
      where: {
        agencyId: context.agencyId,
        deletedAt: null,
        id: query.locationId,
        ...(restaurantId ? { restaurantId } : {}),
        ...(context.restaurantId ? { restaurantId: context.restaurantId } : {})
      }
    });

    if (!location) {
      throw badRequest("Location must belong to the active agency and selected restaurant.");
    }
  }

  return {
    includeArchived: query.includeArchived,
    locationId: query.locationId,
    restaurantId
  };
}

function competitorWhere(
  context: RequestContext,
  scope: {
    includeArchived: boolean;
    locationId: string | undefined;
    restaurantId: string | undefined;
  }
): Prisma.CompetitorWhereInput {
  return {
    agencyId: context.agencyId,
    ...(scope.includeArchived
      ? {}
      : {
          deletedAt: null,
          status: CompetitorStatus.ACTIVE
        }),
    ...(scope.restaurantId ? { restaurantId: scope.restaurantId } : {}),
    ...(scope.locationId ? { locationId: scope.locationId } : {})
  };
}

function toCompetitorListItem(competitor: CompetitorRecord): CompetitorListItem {
  return {
    createdAt: competitor.createdAt,
    id: competitor.id,
    locationId: competitor.locationId,
    locationName: competitor.location ? formatLocationName(competitor.location) : null,
    name: competitor.name,
    notes: competitor.notes,
    observations: competitor.observations.map(toCompetitorObservationItem),
    restaurantId: competitor.restaurantId,
    restaurantName: competitor.restaurant.name,
    sourceUrl: competitor.sourceUrl,
    status: competitor.status,
    updatedAt: competitor.updatedAt
  };
}

function toCompetitorObservationItem(
  observation: ObservationRecord
): CompetitorObservationItem {
  return {
    channelSource: metadataString(observation.metadata, "channelSource"),
    collectedAt: observation.collectedAt,
    createdAt: observation.createdAt,
    evidenceNote: metadataString(observation.metadata, "evidenceNote"),
    id: observation.id,
    observedAt: observation.observedAt,
    sentiment: metadataSentiment(observation.metadata),
    signalType: observation.signalType,
    sourceUrl: observation.sourceUrl,
    summary: observation.value,
    updatedAt: observation.updatedAt
  };
}

function isJsonRecord(value: Prisma.JsonValue | null): value is Prisma.JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function metadataString(metadata: Prisma.JsonValue | null, key: string): string | null {
  if (!isJsonRecord(metadata)) {
    return null;
  }

  const value = metadata[key];

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function metadataSentiment(metadata: Prisma.JsonValue | null): Sentiment {
  const value = metadataString(metadata, "sentiment");

  return value && sentimentValues.has(value as Sentiment) ? (value as Sentiment) : Sentiment.UNKNOWN;
}

function formatLocationName(location: {
  city: string | null;
  name: string;
  region: string | null;
}): string {
  return [location.name, location.city, location.region].filter(Boolean).join(", ");
}
