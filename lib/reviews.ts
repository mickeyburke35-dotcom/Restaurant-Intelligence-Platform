import { Prisma, Sentiment } from "@prisma/client";
import { z } from "zod";
import { notFound } from "@/lib/api-errors";
import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/lib/request-context";

const reviewSortFields = [
  "publishedAt",
  "rating",
  "sentiment",
  "restaurant",
  "location",
  "source",
  "collectedAt"
] as const;

const reviewSortDirections = ["asc", "desc"] as const;

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

function emptyToUndefined(value: unknown) {
  if (value === "") {
    return undefined;
  }

  return value;
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

function dateOnlyToUtc(value: string, boundary: "start" | "end"): Date {
  const [year, month, day] = value.split("-").map(Number);

  if (boundary === "start") {
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  }

  return new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
}

const optionalUuidSchema = z.preprocess(emptyToUndefined, z.string().uuid().optional());

const optionalSearchSchema = z.preprocess(
  emptyToUndefined,
  z.string().trim().min(1).max(160).optional()
);

const optionalDateOnlySchema = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .regex(dateOnlyPattern, "Date must use YYYY-MM-DD format.")
    .refine(isValidDateOnly, "Date must be a valid calendar date.")
    .optional()
);

const optionalRatingSchema = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int().min(1).max(5).optional()
);

export const reviewRouteParamsSchema = z.object({
  reviewId: z.string().uuid()
});

export const selectedReviewQuerySchema = z.object({
  reviewId: optionalUuidSchema
});

export const listReviewsQuerySchema = z
  .object({
    search: optionalSearchSchema,
    restaurantId: optionalUuidSchema,
    locationId: optionalUuidSchema,
    reviewSourceId: optionalUuidSchema,
    rating: optionalRatingSchema,
    sentiment: z.preprocess(emptyToUndefined, z.nativeEnum(Sentiment).optional()),
    dateFrom: optionalDateOnlySchema,
    dateTo: optionalDateOnlySchema,
    sortBy: z.enum(reviewSortFields).optional().default("publishedAt"),
    sortDirection: z.enum(reviewSortDirections).optional().default("desc"),
    page: z.coerce.number().int().min(1).optional().default(1),
    pageSize: z.coerce.number().int().min(5).max(100).optional().default(20)
  })
  .refine(
    (value) =>
      !value.dateFrom ||
      !value.dateTo ||
      dateOnlyToUtc(value.dateFrom, "start") <= dateOnlyToUtc(value.dateTo, "end"),
    {
      message: "dateTo must be on or after dateFrom.",
      path: ["dateTo"]
    }
  );

const reviewListSelect = {
  id: true,
  restaurantId: true,
  locationId: true,
  reviewSourceId: true,
  externalId: true,
  rating: true,
  title: true,
  text: true,
  language: true,
  sentiment: true,
  sentimentScore: true,
  themes: true,
  reviewUrl: true,
  publishedAt: true,
  collectedAt: true,
  createdAt: true,
  updatedAt: true,
  restaurant: {
    select: {
      id: true,
      name: true,
      segment: true,
      status: true
    }
  },
  location: {
    select: {
      id: true,
      name: true,
      city: true,
      region: true,
      status: true
    }
  },
  reviewSource: {
    select: {
      id: true,
      name: true,
      sourceType: true,
      connectionStatus: true
    }
  }
} satisfies Prisma.ReviewSelect;

const restaurantFilterSelect = {
  id: true,
  name: true,
  segment: true,
  status: true
} satisfies Prisma.RestaurantSelect;

const locationFilterSelect = {
  id: true,
  restaurantId: true,
  name: true,
  city: true,
  region: true,
  status: true
} satisfies Prisma.LocationSelect;

const reviewSourceFilterSelect = {
  id: true,
  restaurantId: true,
  locationId: true,
  name: true,
  sourceType: true,
  connectionStatus: true
} satisfies Prisma.ReviewSourceSelect;

export type ReviewSortField = (typeof reviewSortFields)[number];
export type ReviewSortDirection = (typeof reviewSortDirections)[number];
export type ListReviewsQuery = z.infer<typeof listReviewsQuerySchema>;
export type ReviewListItem = Prisma.ReviewGetPayload<{ select: typeof reviewListSelect }>;
export type ReviewDetailResponse = ReviewListItem;
export type RestaurantFilterOption = Prisma.RestaurantGetPayload<{
  select: typeof restaurantFilterSelect;
}>;
export type LocationFilterOption = Prisma.LocationGetPayload<{
  select: typeof locationFilterSelect;
}>;
export type ReviewSourceFilterOption = Prisma.ReviewSourceGetPayload<{
  select: typeof reviewSourceFilterSelect;
}>;

export type ReviewPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ReviewSummary = {
  total: number;
  averageRating: Prisma.Decimal | null;
  sentimentCounts: Record<Sentiment, number>;
};

export type ListReviewsResult = {
  data: ReviewListItem[];
  pagination: ReviewPagination;
  summary: ReviewSummary;
};

export type ReviewFilterOptions = {
  restaurants: RestaurantFilterOption[];
  locations: LocationFilterOption[];
  sources: ReviewSourceFilterOption[];
};

type SearchParamRecord = Record<string, string | string[] | undefined>;

function searchParamsToObject(searchParams: URLSearchParams): Record<string, string> {
  return Object.fromEntries(searchParams.entries());
}

function searchParamRecordToObject(searchParams: SearchParamRecord): Record<string, string> {
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

function emptySentimentCounts(): Record<Sentiment, number> {
  return {
    [Sentiment.POSITIVE]: 0,
    [Sentiment.NEUTRAL]: 0,
    [Sentiment.NEGATIVE]: 0,
    [Sentiment.MIXED]: 0,
    [Sentiment.UNKNOWN]: 0
  };
}

function buildReviewWhere(input: ListReviewsQuery, agencyId: string): Prisma.ReviewWhereInput {
  const where: Prisma.ReviewWhereInput = {
    agencyId,
    deletedAt: null
  };

  if (input.restaurantId) {
    where.restaurantId = input.restaurantId;
  }

  if (input.locationId) {
    where.locationId = input.locationId;
  }

  if (input.reviewSourceId) {
    where.reviewSourceId = input.reviewSourceId;
  }

  if (input.rating !== undefined) {
    where.rating = input.rating;
  }

  if (input.sentiment) {
    where.sentiment = input.sentiment;
  }

  if (input.dateFrom || input.dateTo) {
    where.publishedAt = {
      ...(input.dateFrom ? { gte: dateOnlyToUtc(input.dateFrom, "start") } : {}),
      ...(input.dateTo ? { lte: dateOnlyToUtc(input.dateTo, "end") } : {})
    };
  }

  if (input.search) {
    const search = input.search;
    const mode = "insensitive" as const;

    where.OR = [
      { title: { contains: search, mode } },
      { text: { contains: search, mode } },
      { externalId: { contains: search, mode } },
      { restaurant: { name: { contains: search, mode } } },
      { location: { name: { contains: search, mode } } },
      { reviewSource: { name: { contains: search, mode } } }
    ];
  }

  return where;
}

function buildReviewOrderBy(
  sortBy: ReviewSortField,
  sortDirection: ReviewSortDirection
): Prisma.ReviewOrderByWithRelationInput[] {
  switch (sortBy) {
    case "rating":
      return [{ rating: sortDirection }, { publishedAt: "desc" }, { id: "asc" }];
    case "sentiment":
      return [{ sentiment: sortDirection }, { publishedAt: "desc" }, { id: "asc" }];
    case "restaurant":
      return [{ restaurant: { name: sortDirection } }, { publishedAt: "desc" }, { id: "asc" }];
    case "location":
      return [{ location: { name: sortDirection } }, { publishedAt: "desc" }, { id: "asc" }];
    case "source":
      return [{ reviewSource: { name: sortDirection } }, { publishedAt: "desc" }, { id: "asc" }];
    case "collectedAt":
      return [{ collectedAt: sortDirection }, { publishedAt: "desc" }, { id: "asc" }];
    case "publishedAt":
    default:
      return [{ publishedAt: sortDirection }, { id: "asc" }];
  }
}

export function parseListReviewsQuery(searchParams: URLSearchParams): ListReviewsQuery {
  return listReviewsQuerySchema.parse(searchParamsToObject(searchParams));
}

export function parseListReviewsSearchParams(searchParams: SearchParamRecord): ListReviewsQuery {
  return listReviewsQuerySchema.parse(searchParamRecordToObject(searchParams));
}

export function parseSelectedReviewIdSearchParams(
  searchParams: SearchParamRecord
): string | undefined {
  return selectedReviewQuerySchema.parse(searchParamRecordToObject(searchParams)).reviewId;
}

export async function listReviews(
  context: RequestContext,
  input: ListReviewsQuery
): Promise<ListReviewsResult> {
  const where = buildReviewWhere(input, context.agencyId);
  const aggregate = await prisma.review.aggregate({
    where,
    _count: {
      _all: true
    },
    _avg: {
      rating: true
    }
  });

  const total = aggregate._count._all;
  const totalPages = Math.max(1, Math.ceil(total / input.pageSize));
  const page = Math.min(input.page, totalPages);
  const skip = (page - 1) * input.pageSize;

  const [data, sentimentRows] = await prisma.$transaction([
    prisma.review.findMany({
      where,
      orderBy: buildReviewOrderBy(input.sortBy, input.sortDirection),
      skip,
      take: input.pageSize,
      select: reviewListSelect
    }),
    prisma.review.groupBy({
      by: ["sentiment"],
      where,
      orderBy: {
        sentiment: "asc"
      },
      _count: {
        _all: true
      }
    })
  ]);

  const sentimentCounts = emptySentimentCounts();

  for (const row of sentimentRows) {
    const count = row._count;
    sentimentCounts[row.sentiment] =
      typeof count === "object" && count !== null && "_all" in count ? count._all ?? 0 : 0;
  }

  return {
    data,
    pagination: {
      page,
      pageSize: input.pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    },
    summary: {
      total,
      averageRating: aggregate._avg.rating,
      sentimentCounts
    }
  };
}

export async function listReviewFilterOptions(
  context: RequestContext
): Promise<ReviewFilterOptions> {
  const [restaurants, locations, sources] = await prisma.$transaction([
    prisma.restaurant.findMany({
      where: {
        agencyId: context.agencyId,
        deletedAt: null
      },
      orderBy: [{ name: "asc" }, { createdAt: "desc" }],
      select: restaurantFilterSelect
    }),
    prisma.location.findMany({
      where: {
        agencyId: context.agencyId,
        deletedAt: null
      },
      orderBy: [{ name: "asc" }, { createdAt: "desc" }],
      select: locationFilterSelect
    }),
    prisma.reviewSource.findMany({
      where: {
        agencyId: context.agencyId,
        deletedAt: null
      },
      orderBy: [{ name: "asc" }, { createdAt: "desc" }],
      select: reviewSourceFilterSelect
    })
  ]);

  return {
    restaurants,
    locations,
    sources
  };
}

export async function getReviewDetail(
  context: RequestContext,
  reviewId: string
): Promise<ReviewDetailResponse> {
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      agencyId: context.agencyId,
      deletedAt: null
    },
    select: reviewListSelect
  });

  if (!review) {
    throw notFound("Review not found.");
  }

  return review;
}
