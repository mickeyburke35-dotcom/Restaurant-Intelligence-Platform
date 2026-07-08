import {
  AuditEntityType,
  ConfidenceLevel,
  InsightStatus,
  InsightType,
  MembershipRole,
  Prisma
} from "@prisma/client";
import { z } from "zod";
import { badRequest, notFound } from "@/lib/api-errors";
import {
  generateReviewInsightDrafts,
  REVIEW_INSIGHT_PROMPT_VERSION,
  type ReviewInsightEvidence
} from "@/lib/ai/review-insights";
import { prisma } from "@/lib/prisma";
import { AccessError, type RequestContext } from "@/lib/request-context";

const insightManagerRoles = new Set<MembershipRole>([
  MembershipRole.OWNER,
  MembershipRole.ADMIN,
  MembershipRole.MANAGER,
  MembershipRole.ANALYST
]);

const actionableInsightStatuses = [InsightStatus.APPROVED, InsightStatus.REJECTED] as const;

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

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
const maxInsightSourceReviews = 50;

const optionalUuidSchema = z.preprocess(emptyToUndefined, z.string().uuid().optional());
const optionalNullableUuidSchema = z.preprocess(
  emptyToNull,
  z.string().uuid().nullable().optional()
);
const optionalDateOnlySchema = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .regex(dateOnlyPattern, "Date must use YYYY-MM-DD format.")
    .refine(isValidDateOnly, "Date must be a valid calendar date.")
    .optional()
);

export const generateInsightsRequestSchema = z
  .object({
    dateRangeEnd: optionalDateOnlySchema,
    dateRangeStart: optionalDateOnlySchema,
    locationId: optionalNullableUuidSchema,
    restaurantId: z.string().uuid(),
    reviewIds: z
      .array(z.string().uuid())
      .min(1, "Select at least one review or provide a date range.")
      .max(maxInsightSourceReviews, `Select ${maxInsightSourceReviews} or fewer reviews.`)
      .transform((reviewIds) => Array.from(new Set(reviewIds)))
      .optional()
  })
  .strict()
  .superRefine((value, context) => {
    const hasDateRange = Boolean(value.dateRangeStart || value.dateRangeEnd);

    if (hasDateRange && (!value.dateRangeStart || !value.dateRangeEnd)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide both dateRangeStart and dateRangeEnd.",
        path: value.dateRangeStart ? ["dateRangeEnd"] : ["dateRangeStart"]
      });
    }

    if (!value.reviewIds && !hasDateRange) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide a date range or selected review IDs.",
        path: ["dateRangeStart"]
      });
    }

    if (
      value.dateRangeStart &&
      value.dateRangeEnd &&
      dateOnlyToUtc(value.dateRangeStart, "start") > dateOnlyToUtc(value.dateRangeEnd, "end")
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "dateRangeEnd must be on or after dateRangeStart.",
        path: ["dateRangeEnd"]
      });
    }
  })
  .transform((value) => ({
    ...value,
    locationId: value.locationId ?? null,
    reviewIds: value.reviewIds ?? null
  }));

export const reviewInsightActionSchema = z
  .object({
    reviewNotes: z
      .preprocess(
        (value) => {
          if (value === undefined || value === null) {
            return undefined;
          }

          const trimmed = String(value).trim();

          return trimmed.length > 0 ? trimmed : undefined;
        },
        z.string().max(2000).optional()
      ),
    status: z.enum(actionableInsightStatuses)
  })
  .strict();

export const insightRouteParamsSchema = z.object({
  insightId: z.string().uuid()
});

export const listInsightsQuerySchema = z.object({
  insightId: optionalUuidSchema,
  restaurantId: optionalUuidSchema,
  status: z.preprocess(emptyToUndefined, z.nativeEnum(InsightStatus).optional())
});

export type GenerateInsightsRequest = z.infer<typeof generateInsightsRequestSchema>;
export type ReviewInsightAction = z.infer<typeof reviewInsightActionSchema>;
export type ListInsightsQuery = z.infer<typeof listInsightsQuerySchema>;

const insightSelect = {
  id: true,
  agencyId: true,
  restaurantId: true,
  locationId: true,
  createdByUserId: true,
  reviewedByUserId: true,
  type: true,
  title: true,
  summary: true,
  sentiment: true,
  themes: true,
  confidence: true,
  confidenceLevel: true,
  model: true,
  promptVersion: true,
  sourceReviewCount: true,
  highImpact: true,
  status: true,
  reviewedAt: true,
  reviewNotes: true,
  generatedAt: true,
  createdAt: true,
  updatedAt: true,
  restaurant: {
    select: {
      id: true,
      name: true,
      segment: true
    }
  },
  location: {
    select: {
      id: true,
      name: true,
      city: true,
      region: true
    }
  },
  createdBy: {
    select: {
      id: true,
      email: true,
      name: true
    }
  },
  reviewedBy: {
    select: {
      id: true,
      email: true,
      name: true
    }
  },
  sourceReviews: {
    orderBy: {
      createdAt: "asc"
    },
    select: {
      id: true,
      evidenceExcerpt: true,
      relevanceScore: true,
      review: {
        select: {
          id: true,
          rating: true,
          sentiment: true,
          text: true,
          title: true,
          publishedAt: true,
          reviewUrl: true,
          location: {
            select: {
              id: true,
              name: true,
              city: true,
              region: true
            }
          },
          reviewSource: {
            select: {
              id: true,
              name: true,
              sourceType: true
            }
          }
        }
      }
    }
  }
} satisfies Prisma.InsightSelect;

const reviewOptionSelect = {
  id: true,
  restaurantId: true,
  locationId: true,
  rating: true,
  sentiment: true,
  text: true,
  title: true,
  publishedAt: true,
  restaurant: {
    select: {
      id: true,
      name: true
    }
  },
  location: {
    select: {
      id: true,
      name: true,
      city: true,
      region: true
    }
  },
  reviewSource: {
    select: {
      id: true,
      name: true,
      sourceType: true
    }
  }
} satisfies Prisma.ReviewSelect;

const reviewEvidenceSelect = {
  ...reviewOptionSelect,
  themes: true,
  reviewSource: {
    select: {
      approvalStatus: true,
      id: true,
      name: true,
      sourceType: true
    }
  }
} satisfies Prisma.ReviewSelect;

const restaurantOptionSelect = {
  id: true,
  name: true,
  segment: true
} satisfies Prisma.RestaurantSelect;

const locationOptionSelect = {
  id: true,
  restaurantId: true,
  name: true,
  city: true,
  region: true
} satisfies Prisma.LocationSelect;

export type InsightReviewItem = Prisma.InsightGetPayload<{ select: typeof insightSelect }>;
export type InsightReviewOption = Prisma.ReviewGetPayload<{ select: typeof reviewOptionSelect }>;
export type InsightRestaurantOption = Prisma.RestaurantGetPayload<{
  select: typeof restaurantOptionSelect;
}>;
export type InsightLocationOption = Prisma.LocationGetPayload<{ select: typeof locationOptionSelect }>;

export type InsightReviewPageData = {
  insights: InsightReviewItem[];
  locations: InsightLocationOption[];
  query: ListInsightsQuery;
  restaurants: InsightRestaurantOption[];
  reviewOptions: InsightReviewOption[];
};

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

export function parseListInsightsSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): ListInsightsQuery {
  return listInsightsQuerySchema.parse(searchParamRecordToObject(searchParams));
}

export function canManageInsights(context: RequestContext): boolean {
  return insightManagerRoles.has(context.role);
}

export function assertCanManageInsights(context: RequestContext): void {
  if (!canManageInsights(context)) {
    throw new AccessError("Your role cannot manage AI insights for this agency.", 403);
  }
}

export async function getInsightReviewPageData(
  context: RequestContext,
  query: ListInsightsQuery
): Promise<InsightReviewPageData> {
  const scopedRestaurantId = context.restaurantId ?? query.restaurantId;
  const restaurantScope = context.restaurantId ? { id: context.restaurantId } : {};
  const insightWhere: Prisma.InsightWhereInput = {
    agencyId: context.agencyId,
    deletedAt: null,
    ...(scopedRestaurantId ? { restaurantId: scopedRestaurantId } : {}),
    ...(query.status ? { status: query.status } : {})
  };

  const [insights, restaurants, locations, reviewOptions] = await prisma.$transaction([
    prisma.insight.findMany({
      where: insightWhere,
      orderBy: [{ status: "asc" }, { generatedAt: "desc" }, { createdAt: "desc" }],
      take: 50,
      select: insightSelect
    }),
    prisma.restaurant.findMany({
      where: {
        agencyId: context.agencyId,
        deletedAt: null,
        ...restaurantScope
      },
      orderBy: [{ name: "asc" }, { createdAt: "desc" }],
      select: restaurantOptionSelect
    }),
    prisma.location.findMany({
      where: {
        agencyId: context.agencyId,
        deletedAt: null,
        ...(scopedRestaurantId ? { restaurantId: scopedRestaurantId } : {})
      },
      orderBy: [{ name: "asc" }, { createdAt: "desc" }],
      select: locationOptionSelect
    }),
    prisma.review.findMany({
      where: {
        agencyId: context.agencyId,
        deletedAt: null,
        ...(scopedRestaurantId ? { restaurantId: scopedRestaurantId } : {}),
        reviewSource: {
          approvalStatus: "APPROVED",
          deletedAt: null
        }
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 60,
      select: reviewOptionSelect
    })
  ]);

  return {
    insights,
    locations,
    query,
    restaurants,
    reviewOptions
  };
}

export async function generateDraftInsights(
  context: RequestContext,
  input: GenerateInsightsRequest
): Promise<InsightReviewItem[]> {
  assertCanManageInsights(context);

  if (context.restaurantId && input.restaurantId !== context.restaurantId) {
    throw new AccessError("Your role cannot generate insights for this restaurant.", 403);
  }

  const locationId = input.locationId ?? null;
  const dateRangeStart = input.dateRangeStart ? dateOnlyToUtc(input.dateRangeStart, "start") : null;
  const dateRangeEnd = input.dateRangeEnd ? dateOnlyToUtc(input.dateRangeEnd, "end") : null;
  const requestedReviewIds = input.reviewIds;
  const restaurant = await prisma.restaurant.findFirst({
    where: {
      agencyId: context.agencyId,
      deletedAt: null,
      id: input.restaurantId
    },
    select: restaurantOptionSelect
  });

  if (!restaurant) {
    throw notFound("Restaurant not found.");
  }

  const location = locationId
    ? await prisma.location.findFirst({
        where: {
          agencyId: context.agencyId,
          deletedAt: null,
          id: locationId,
          restaurantId: input.restaurantId
        },
        select: locationOptionSelect
      })
    : null;

  if (locationId && !location) {
    throw badRequest("Location must belong to the selected restaurant.");
  }

  const reviewWhere: Prisma.ReviewWhereInput = {
    agencyId: context.agencyId,
    deletedAt: null,
    restaurantId: input.restaurantId,
    ...(locationId ? { locationId } : {}),
    ...(dateRangeStart && dateRangeEnd
      ? {
          publishedAt: {
            gte: dateRangeStart,
            lte: dateRangeEnd
          }
        }
      : {}),
    ...(requestedReviewIds
      ? {
          id: {
            in: requestedReviewIds
          }
        }
      : {}),
    reviewSource: {
      approvalStatus: "APPROVED",
      deletedAt: null
    }
  };
  const reviews = await prisma.review.findMany({
    where: reviewWhere,
    orderBy: [{ publishedAt: "desc" }, { id: "asc" }],
    ...(requestedReviewIds ? {} : { take: maxInsightSourceReviews + 1 }),
    select: reviewEvidenceSelect
  });

  if (requestedReviewIds && reviews.length !== requestedReviewIds.length) {
    throw badRequest(
      "Selected reviews must belong to the active agency, selected restaurant, selected location, date range, and approved source."
    );
  }

  if (!requestedReviewIds && reviews.length > maxInsightSourceReviews) {
    throw badRequest(
      `Date range includes more than ${maxInsightSourceReviews} approved imported reviews. Narrow the date range or select specific reviews.`
    );
  }

  if (reviews.length === 0) {
    throw badRequest("No approved imported reviews match the selected restaurant, location, and date range.");
  }

  const selectedReviewIds = requestedReviewIds ?? reviews.map((review) => review.id);
  const selectedReviewIdSet = new Set(selectedReviewIds);
  const evidenceByReviewId = new Map(reviews.map((review) => [review.id, review]));
  const generatedResult = await generateReviewInsightDrafts(
    reviews.map((review): ReviewInsightEvidence => ({
      id: review.id,
      locationName: formatLocationName(review.location),
      publishedAt: review.publishedAt,
      rating: review.rating?.toString() ?? null,
      restaurantName: review.restaurant.name,
      reviewSourceName: review.reviewSource.name,
      reviewSourceType: review.reviewSource.sourceType,
      sentiment: review.sentiment,
      text: review.text,
      themes: review.themes,
      title: review.title
    })),
    {
      dateRangeEnd,
      dateRangeStart,
      locationName: location ? formatLocationName(location) : null,
      restaurantName: restaurant.name
    }
  );
  const generatedInsights = generatedResult.insights;

  const normalizedDrafts = generatedInsights.map((insight) => {
    const sourceReviewIds = Array.from(new Set(insight.sourceReviewIds));
    const invalidSourceReviewIds = sourceReviewIds.filter(
      (reviewId) => !selectedReviewIdSet.has(reviewId)
    );

    if (invalidSourceReviewIds.length > 0) {
      throw badRequest("AI response referenced a review that was not selected.");
    }

    const confidenceLevel = insight.confidenceLevel ?? confidenceLevelFromScore(insight.confidence);
    const confidence = insight.confidence ?? confidenceScoreFromLevel(confidenceLevel);

    return {
      ...insight,
      confidence,
      confidenceLevel,
      highImpact: insight.highImpact || insight.type === InsightType.RECOMMENDATION,
      sourceReviewIds
    };
  });

  const draftsWithEvidence = normalizedDrafts.filter((insight) => insight.sourceReviewIds.length > 0);

  if (draftsWithEvidence.length === 0) {
    return [];
  }

  const inferredLocationId = inferInsightLocationId(reviews, locationId);
  const model = generatedResult.model;
  const generatedAt = new Date();

  return prisma.$transaction(async (tx) => {
    const createdInsights: InsightReviewItem[] = [];

    for (const insight of draftsWithEvidence) {
      const createdInsight = await tx.insight.create({
        data: {
          agency: {
            connect: {
              id: context.agencyId
            }
          },
          confidence:
            insight.confidence === null || insight.confidence === undefined
              ? null
              : new Prisma.Decimal(insight.confidence.toFixed(4)),
          confidenceLevel: insight.confidenceLevel,
          createdBy: {
            connect: {
              id: context.userId
            }
          },
          generatedAt,
          highImpact: insight.highImpact,
          ...(inferredLocationId
            ? {
                location: {
                  connect: {
                    id_agencyId: {
                      agencyId: context.agencyId,
                      id: inferredLocationId
                    }
                  }
                }
              }
            : {}),
          model,
          promptVersion: REVIEW_INSIGHT_PROMPT_VERSION,
          restaurant: {
            connect: {
              id_agencyId: {
                agencyId: context.agencyId,
                id: input.restaurantId
              }
            }
          },
          sentiment: insight.sentiment,
          sourceReviewCount: insight.sourceReviewIds.length,
          sourceReviews: {
            create: insight.sourceReviewIds.map((reviewId) => {
              const review = evidenceByReviewId.get(reviewId);

              if (!review) {
                throw badRequest("AI response referenced a review that was not selected.");
              }

              return {
                agency: {
                  connect: {
                    id: context.agencyId
                  }
                },
                evidenceExcerpt: evidenceExcerpt(review),
                review: {
                  connect: {
                    id_agencyId: {
                      agencyId: context.agencyId,
                      id: reviewId
                    }
                  }
                }
              };
            })
          },
          status: InsightStatus.DRAFT,
          summary: insight.summary,
          themes: insight.themes,
          title: insight.title,
          type: insight.type
        },
        select: insightSelect
      });

      createdInsights.push(createdInsight);
    }

    await tx.auditLog.create({
      data: {
        action: "ai_insights_generated",
        agencyId: context.agencyId,
        entityId: createdInsights[0]?.id ?? null,
        entityType: AuditEntityType.INSIGHT,
        metadata: {
          dateRangeEnd: dateRangeEnd?.toISOString() ?? null,
          dateRangeStart: dateRangeStart?.toISOString() ?? null,
          generatedInsightCount: createdInsights.length,
          locationId,
          model,
          promptVersion: REVIEW_INSIGHT_PROMPT_VERSION,
          reviewIds: selectedReviewIds,
          restaurantId: restaurant.id,
          sourceReviewCount: selectedReviewIds.length
        },
        userId: context.userId
      }
    });

    return createdInsights;
  });
}

export async function reviewInsightStatus(
  context: RequestContext,
  insightId: string,
  input: ReviewInsightAction
): Promise<InsightReviewItem> {
  assertCanManageInsights(context);

  const currentInsight = await prisma.insight.findFirst({
    where: {
      agencyId: context.agencyId,
      deletedAt: null,
      id: insightId,
      ...(context.restaurantId ? { restaurantId: context.restaurantId } : {})
    },
    select: {
      id: true,
      sourceReviewCount: true,
      status: true
    }
  });

  if (!currentInsight) {
    throw notFound("Insight not found.");
  }

  if (currentInsight.status !== InsightStatus.DRAFT) {
    throw badRequest("Only draft insights can be approved or rejected. Reviewed insights are locked.");
  }

  if (input.status === InsightStatus.APPROVED && currentInsight.sourceReviewCount < 1) {
    throw badRequest("Insight requires source reviews before approval.");
  }

  const reviewedAt = new Date();
  const updatedInsight = await prisma.insight.update({
    where: {
      id_agencyId: {
        agencyId: context.agencyId,
        id: currentInsight.id
      }
    },
    data: {
      reviewedAt,
      reviewedByUserId: context.userId,
      reviewNotes: input.reviewNotes ?? null,
      status: input.status
    },
    select: insightSelect
  });

  await prisma.auditLog.create({
    data: {
      action: input.status === InsightStatus.APPROVED ? "ai_insight_approved" : "ai_insight_rejected",
      agencyId: context.agencyId,
      entityId: insightId,
      entityType: AuditEntityType.INSIGHT,
      metadata: {
        reviewNotesPresent: Boolean(input.reviewNotes),
        status: input.status
      },
      userId: context.userId
    }
  });

  return updatedInsight;
}

function confidenceLevelFromScore(score: number | null | undefined): ConfidenceLevel {
  if (score === null || score === undefined) {
    return ConfidenceLevel.LOW;
  }

  if (score >= 0.75) {
    return ConfidenceLevel.HIGH;
  }

  if (score >= 0.45) {
    return ConfidenceLevel.MEDIUM;
  }

  return ConfidenceLevel.LOW;
}

function confidenceScoreFromLevel(level: ConfidenceLevel): number {
  switch (level) {
    case ConfidenceLevel.HIGH:
      return 0.85;
    case ConfidenceLevel.MEDIUM:
      return 0.6;
    case ConfidenceLevel.LOW:
      return 0.3;
  }
}

function evidenceExcerpt(
  review: Prisma.ReviewGetPayload<{ select: typeof reviewEvidenceSelect }>
): string {
  const sourceText =
    review.text?.trim() ||
    review.title?.trim() ||
    `Rating ${review.rating?.toString() ?? "not recorded"} review from ${formatLocationName(
      review.location
    )}`;

  return sourceText.length > 500 ? `${sourceText.slice(0, 497)}...` : sourceText;
}

function formatLocationName(location: {
  city: string | null;
  name: string;
  region: string | null;
}): string {
  return [location.name, location.city, location.region].filter(Boolean).join(", ");
}

function inferInsightLocationId(
  reviews: Array<{ locationId: string }>,
  requestedLocationId: string | null
): string | null {
  if (requestedLocationId) {
    return requestedLocationId;
  }

  const locationIds = new Set(reviews.map((review) => review.locationId));

  return locationIds.size === 1 ? reviews[0]?.locationId ?? null : null;
}
