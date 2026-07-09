import {
  AuditEntityType,
  InsightStatus,
  MembershipRole,
  Prisma,
  ReportFormat,
  ReportStatus
} from "@prisma/client";
import { z } from "zod";
import { badRequest, notFound } from "@/lib/api-errors";
import { prisma } from "@/lib/prisma";
import { AccessError, type RequestContext } from "@/lib/request-context";

const reportManagerRoles = new Set<MembershipRole>([
  MembershipRole.OWNER,
  MembershipRole.ADMIN,
  MembershipRole.MANAGER,
  MembershipRole.ANALYST
]);

const reportExcludedInsightStatuses = [InsightStatus.DRAFT, InsightStatus.REJECTED] as const;

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

function emptyToNull(value: unknown) {
  if (value === "") {
    return null;
  }

  return value;
}

function normalizeDateInput(value: unknown) {
  return typeof value === "string" ? value.trim() : value;
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

function dateOnlyFromUtc(value: Date): string {
  return value.toISOString().slice(0, 10);
}

const requiredDateOnlySchema = z.preprocess(
  normalizeDateInput,
  z
    .string()
    .regex(dateOnlyPattern, "Date must use YYYY-MM-DD format.")
    .refine(isValidDateOnly, "Date must be a valid calendar date.")
);

export const createReportRequestSchema = z
  .object({
    dateRangeEnd: requiredDateOnlySchema,
    dateRangeStart: requiredDateOnlySchema,
    locationId: z.preprocess(emptyToNull, z.string().uuid().nullable().optional()),
    restaurantId: z.string().uuid()
  })
  .strict()
  .refine(
    (value) =>
      dateOnlyToUtc(value.dateRangeStart, "start") <= dateOnlyToUtc(value.dateRangeEnd, "end"),
    {
      message: "dateRangeEnd must be on or after dateRangeStart.",
      path: ["dateRangeEnd"]
    }
  );

export const reportRouteParamsSchema = z.object({
  reportId: z.string().uuid()
});

const reportSourceSchema = z.object({
  evidenceExcerpt: z.string().nullable(),
  locationName: z.string(),
  publishedAt: z.string(),
  rating: z.number().nullable(),
  reviewId: z.string(),
  reviewUrl: z.string().nullable(),
  sentiment: z.string(),
  sourceName: z.string(),
  sourceType: z.string(),
  title: z.string().nullable()
});

const reportInsightSchema = z.object({
  approvedAt: z.string().nullable(),
  confidence: z.number().nullable(),
  confidenceLevel: z.string().nullable(),
  highImpact: z.boolean(),
  insightId: z.string(),
  sentiment: z.string(),
  sourceReviewCount: z.number(),
  sources: z.array(reportSourceSchema),
  summary: z.string(),
  themes: z.array(z.string()),
  title: z.string(),
  type: z.string()
});

export const storedReportSectionsSchema = z.object({
  generatedAt: z.string(),
  insights: z.array(reportInsightSchema),
  overview: z.object({
    approvedInsightCount: z.number().optional(),
    excludedDraftRejectedInsightCount: z.number().optional(),
    highImpactCount: z.number(),
    insightCount: z.number(),
    sentimentCounts: z.record(z.number()),
    totalSourceReviews: z.number()
  }),
  source: z.literal("APPROVED_INSIGHTS"),
  version: z.literal(1)
});

export type CreateReportRequest = z.infer<typeof createReportRequestSchema>;
export type StoredReportSections = z.infer<typeof storedReportSectionsSchema>;

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

const reportSelect = {
  approvedOnly: true,
  createdAt: true,
  createdByUser: {
    select: {
      email: true,
      id: true,
      name: true
    }
  },
  dateRangeEnd: true,
  dateRangeStart: true,
  failedAt: true,
  failureReason: true,
  fileUrl: true,
  filters: true,
  format: true,
  generatedAt: true,
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
  restaurant: {
    select: {
      id: true,
      name: true,
      segment: true
    }
  },
  restaurantId: true,
  sections: true,
  status: true,
  title: true,
  updatedAt: true
} satisfies Prisma.ReportSelect;

const approvedInsightSelect = {
  confidence: true,
  confidenceLevel: true,
  generatedAt: true,
  highImpact: true,
  id: true,
  reviewedAt: true,
  sentiment: true,
  sourceReviewCount: true,
  sourceReviews: {
    orderBy: {
      createdAt: "asc"
    },
    select: {
      evidenceExcerpt: true,
      review: {
        select: {
          id: true,
          location: {
            select: {
              city: true,
              name: true,
              region: true
            }
          },
          publishedAt: true,
          rating: true,
          reviewSource: {
            select: {
              name: true,
              sourceType: true
            }
          },
          reviewUrl: true,
          sentiment: true,
          title: true
        }
      }
    }
  },
  summary: true,
  themes: true,
  title: true,
  type: true
} satisfies Prisma.InsightSelect;

export type ReportRecord = Prisma.ReportGetPayload<{ select: typeof reportSelect }>;
export type ReportRestaurantOption = Prisma.RestaurantGetPayload<{
  select: typeof restaurantOptionSelect;
}>;
export type ReportLocationOption = Prisma.LocationGetPayload<{ select: typeof locationOptionSelect }>;

export type ReportsPageData = {
  defaultDateRange: {
    dateRangeEnd: string;
    dateRangeStart: string;
  };
  locations: ReportLocationOption[];
  reports: ReportRecord[];
  restaurants: ReportRestaurantOption[];
};

export type ReportInsightEligibility = {
  approvedInsightCount: number;
  excludedDraftRejectedInsightCount: number;
  exportBlocked: boolean;
  message: string | null;
};

type ApprovedInsight = Prisma.InsightGetPayload<{ select: typeof approvedInsightSelect }>;

type ReportScope = {
  dateRangeEnd: Date;
  dateRangeStart: Date;
  location: ReportLocationOption | null;
  locationId: string | null;
  restaurant: ReportRestaurantOption;
  reviewScope: Prisma.InsightSourceReviewWhereInput;
};

export function canManageReports(context: RequestContext): boolean {
  return reportManagerRoles.has(context.role);
}

export function assertCanManageReports(context: RequestContext): void {
  if (!canManageReports(context)) {
    throw new AccessError("Your role cannot create reports for this agency.", 403);
  }
}

export async function getReportsPageData(context: RequestContext): Promise<ReportsPageData> {
  const restaurantScope = context.restaurantId ? { id: context.restaurantId } : {};
  const [reports, restaurants, locations] = await prisma.$transaction([
    prisma.report.findMany({
      where: {
        agencyId: context.agencyId,
        deletedAt: null,
        ...(context.restaurantId ? { restaurantId: context.restaurantId } : {})
      },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      take: 40,
      select: reportSelect
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
        ...(context.restaurantId ? { restaurantId: context.restaurantId } : {})
      },
      orderBy: [{ name: "asc" }, { createdAt: "desc" }],
      select: locationOptionSelect
    })
  ]);

  return {
    defaultDateRange: defaultReportDateRange(),
    locations,
    reports,
    restaurants
  };
}

export async function getReportDetail(
  context: RequestContext,
  reportId: string
): Promise<ReportRecord> {
  const report = await prisma.report.findFirst({
    where: {
      agencyId: context.agencyId,
      deletedAt: null,
      id: reportId,
      ...(context.restaurantId ? { restaurantId: context.restaurantId } : {})
    },
    select: reportSelect
  });

  if (!report) {
    throw notFound("Report not found.");
  }

  return report;
}

export async function createApprovedInsightsReport(
  context: RequestContext,
  input: CreateReportRequest
): Promise<ReportRecord> {
  assertCanManageReports(context);
  const scope = await resolveReportScope(context, input);

  const [approvedInsights, excludedDraftRejectedInsightCount] = await prisma.$transaction([
    prisma.insight.findMany({
      where: buildReportInsightWhere(context, scope, InsightStatus.APPROVED),
      orderBy: [{ reviewedAt: "desc" }, { generatedAt: "desc" }, { id: "asc" }],
      select: approvedInsightSelect
    }),
    prisma.insight.count({
      where: buildReportInsightWhere(context, scope, {
        in: [...reportExcludedInsightStatuses]
      })
    })
  ]);

  if (approvedInsights.length === 0) {
    throw badRequest(reportExportBlockedMessage, {
      approvedInsightCount: 0,
      excludedDraftRejectedInsightCount
    });
  }

  const generatedAt = new Date();
  const locationName = scope.location ? formatLocationName(scope.location) : null;
  const sections = buildReportSections(approvedInsights, generatedAt, {
    excludedDraftRejectedInsightCount
  });
  const filters = buildReportFilters({
    dateRangeEnd: scope.dateRangeEnd,
    dateRangeStart: scope.dateRangeStart,
    locationId: scope.locationId,
    locationName,
    restaurantId: scope.restaurant.id,
    restaurantName: scope.restaurant.name
  });
  const title = buildReportTitle({
    dateRangeEnd: scope.dateRangeEnd,
    dateRangeStart: scope.dateRangeStart,
    locationName,
    restaurantName: scope.restaurant.name
  });

  return prisma.$transaction(async (tx) => {
    const report = await tx.report.create({
      data: {
        agencyId: context.agencyId,
        approvedOnly: true,
        createdByUserId: context.userId,
        dateRangeEnd: scope.dateRangeEnd,
        dateRangeStart: scope.dateRangeStart,
        filters,
        format: ReportFormat.PDF,
        generatedAt,
        locationId: scope.locationId,
        restaurantId: scope.restaurant.id,
        sections,
        status: ReportStatus.READY,
        title
      },
      select: reportSelect
    });

    await tx.auditLog.create({
      data: {
        action: "report_created",
        agencyId: context.agencyId,
        entityId: report.id,
        entityType: AuditEntityType.REPORT,
        metadata: {
          approvedOnly: true,
          dateRangeEnd: scope.dateRangeEnd.toISOString(),
          dateRangeStart: scope.dateRangeStart.toISOString(),
          excludedDraftRejectedInsightCount,
          insightCount: approvedInsights.length,
          locationId: scope.locationId,
          restaurantId: scope.restaurant.id,
          sourceReviewCount: sections.overview.totalSourceReviews
        },
        userId: context.userId
      }
    });

    return report;
  });
}

export async function getReportInsightEligibility(
  context: RequestContext,
  input: CreateReportRequest
): Promise<ReportInsightEligibility> {
  assertCanManageReports(context);

  const scope = await resolveReportScope(context, input);
  const [approvedInsightCount, excludedDraftRejectedInsightCount] = await prisma.$transaction([
    prisma.insight.count({
      where: buildReportInsightWhere(context, scope, InsightStatus.APPROVED)
    }),
    prisma.insight.count({
      where: buildReportInsightWhere(context, scope, {
        in: [...reportExcludedInsightStatuses]
      })
    })
  ]);

  return {
    approvedInsightCount,
    excludedDraftRejectedInsightCount,
    exportBlocked: approvedInsightCount === 0,
    message: approvedInsightCount === 0 ? reportExportBlockedMessage : null
  };
}

export function parseStoredReportSections(value: Prisma.JsonValue | null): StoredReportSections | null {
  const parsed = storedReportSectionsSchema.safeParse(value);

  return parsed.success ? parsed.data : null;
}

export function reportMetricsFromSections(value: Prisma.JsonValue | null): {
  approvedInsightCount: number;
  excludedDraftRejectedInsightCount: number;
  insightCount: number;
  sourceReviewCount: number;
} {
  const sections = parseStoredReportSections(value);
  const insightCount = sections?.overview.insightCount ?? 0;

  return {
    approvedInsightCount: sections?.overview.approvedInsightCount ?? insightCount,
    excludedDraftRejectedInsightCount:
      sections?.overview.excludedDraftRejectedInsightCount ?? 0,
    insightCount,
    sourceReviewCount: sections?.overview.totalSourceReviews ?? 0
  };
}

async function resolveReportScope(
  context: RequestContext,
  input: CreateReportRequest
): Promise<ReportScope> {
  if (context.restaurantId && input.restaurantId !== context.restaurantId) {
    throw new AccessError("Your role cannot create reports for this restaurant.", 403);
  }

  const locationId = input.locationId ?? null;
  const dateRangeStart = dateOnlyToUtc(input.dateRangeStart, "start");
  const dateRangeEnd = dateOnlyToUtc(input.dateRangeEnd, "end");
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

  const reviewScope: Prisma.InsightSourceReviewWhereInput = {
    agencyId: context.agencyId,
    review: {
      agencyId: context.agencyId,
      deletedAt: null,
      publishedAt: {
        gte: dateRangeStart,
        lte: dateRangeEnd
      },
      restaurantId: input.restaurantId,
      ...(locationId ? { locationId } : {})
    }
  };

  return {
    dateRangeEnd,
    dateRangeStart,
    location,
    locationId,
    restaurant,
    reviewScope
  };
}

function buildReportInsightWhere(
  context: RequestContext,
  scope: ReportScope,
  status: InsightStatus | Prisma.EnumInsightStatusFilter<"Insight">
): Prisma.InsightWhereInput {
  return {
    agencyId: context.agencyId,
    deletedAt: null,
    restaurantId: scope.restaurant.id,
    sourceReviewCount: {
      gt: 0
    },
    sourceReviews: {
      every: scope.reviewScope,
      some: scope.reviewScope
    },
    status
  };
}

function buildReportFilters(input: {
  dateRangeEnd: Date;
  dateRangeStart: Date;
  locationId: string | null;
  locationName: string | null;
  restaurantId: string;
  restaurantName: string;
}): Prisma.InputJsonObject {
  return {
    approvedOnly: true,
    dateRangeEnd: input.dateRangeEnd.toISOString(),
    dateRangeStart: input.dateRangeStart.toISOString(),
    locationId: input.locationId,
    locationName: input.locationName,
    restaurantId: input.restaurantId,
    restaurantName: input.restaurantName,
    version: 1
  };
}

function buildReportSections(
  insights: ApprovedInsight[],
  generatedAt: Date,
  options: {
    excludedDraftRejectedInsightCount: number;
  }
): Prisma.InputJsonObject & StoredReportSections {
  const uniqueSourceReviewIds = new Set<string>();
  const sentimentCounts: Record<string, number> = {};
  const reportInsights = insights.map((insight) => {
    sentimentCounts[insight.sentiment] = (sentimentCounts[insight.sentiment] ?? 0) + 1;

    const sources = insight.sourceReviews.map((sourceReview) => {
      const { review } = sourceReview;
      uniqueSourceReviewIds.add(review.id);

      return {
        evidenceExcerpt: sourceReview.evidenceExcerpt,
        locationName: formatLocationName(review.location),
        publishedAt: review.publishedAt.toISOString(),
        rating: decimalToNumber(review.rating),
        reviewId: review.id,
        reviewUrl: review.reviewUrl,
        sentiment: review.sentiment,
        sourceName: review.reviewSource.name,
        sourceType: review.reviewSource.sourceType,
        title: review.title
      };
    });

    return {
      approvedAt: insight.reviewedAt?.toISOString() ?? null,
      confidence: decimalToNumber(insight.confidence),
      confidenceLevel: insight.confidenceLevel,
      highImpact: insight.highImpact,
      insightId: insight.id,
      sentiment: insight.sentiment,
      sourceReviewCount: sources.length,
      sources,
      summary: insight.summary,
      themes: insight.themes,
      title: insight.title,
      type: insight.type
    };
  });

  return {
    generatedAt: generatedAt.toISOString(),
    insights: reportInsights,
    overview: {
      approvedInsightCount: insights.length,
      excludedDraftRejectedInsightCount: options.excludedDraftRejectedInsightCount,
      highImpactCount: insights.filter((insight) => insight.highImpact).length,
      insightCount: insights.length,
      sentimentCounts,
      totalSourceReviews: uniqueSourceReviewIds.size
    },
    source: "APPROVED_INSIGHTS",
    version: 1
  };
}

const reportExportBlockedMessage =
  "Report export is blocked because this selection has no approved insights. Draft and rejected insights are excluded from reports.";

function buildReportTitle(input: {
  dateRangeEnd: Date;
  dateRangeStart: Date;
  locationName: string | null;
  restaurantName: string;
}): string {
  const scope = input.locationName
    ? `${input.restaurantName} - ${input.locationName}`
    : input.restaurantName;

  return `${scope} report, ${dateOnlyFromUtc(input.dateRangeStart)} to ${dateOnlyFromUtc(
    input.dateRangeEnd
  )}`;
}

function defaultReportDateRange(): { dateRangeEnd: string; dateRangeStart: string } {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 30);

  return {
    dateRangeEnd: dateOnlyFromUtc(end),
    dateRangeStart: dateOnlyFromUtc(start)
  };
}

function decimalToNumber(value: { toString(): string } | number | string | null): number | null {
  if (value === null) {
    return null;
  }

  const parsed = Number(value.toString());

  return Number.isFinite(parsed) ? parsed : null;
}

function formatLocationName(location: {
  city: string | null;
  name: string;
  region: string | null;
}): string {
  return [location.name, location.city, location.region].filter(Boolean).join(", ");
}
