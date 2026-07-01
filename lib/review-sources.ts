import {
  Prisma,
  ReviewSourceConnectionStatus,
  ReviewSourceType,
  SourceApprovalStatus
} from "@prisma/client";
import { z } from "zod";
import { badRequest, notFound } from "@/lib/api-errors";
import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/lib/request-context";

const optionalNullableText = (maxLength: number) =>
  z
    .preprocess(
      (value) => {
        if (value === "") {
          return null;
        }

        return value;
      },
      z.string().trim().min(1).max(maxLength).nullable().optional()
    );

const reviewSourceSelect = {
  id: true,
  agencyId: true,
  restaurantId: true,
  locationId: true,
  name: true,
  sourceType: true,
  approvalStatus: true,
  connectionStatus: true,
  externalAccountId: true,
  externalLocationId: true,
  permissionNotes: true,
  lastSyncAt: true,
  nextSyncAt: true,
  lastError: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  location: {
    select: {
      id: true,
      name: true,
      city: true,
      region: true,
      status: true
    }
  }
} satisfies Prisma.ReviewSourceSelect;

export type ReviewSourceResponse = Prisma.ReviewSourceGetPayload<{
  select: typeof reviewSourceSelect;
}>;

export const reviewSourceRouteParamsSchema = z.object({
  reviewSourceId: z.string().uuid()
});

export const restaurantReviewSourceRouteParamsSchema = z.object({
  restaurantId: z.string().uuid()
});

export const listReviewSourcesQuerySchema = z.object({
  locationId: z.string().uuid().optional(),
  includeArchived: z
    .enum(["true", "false"])
    .optional()
    .default("false")
    .transform((value) => value === "true")
});

export const createReviewSourceSchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    locationId: z.string().uuid().nullable().optional(),
    sourceType: z.nativeEnum(ReviewSourceType),
    approvalStatus: z.nativeEnum(SourceApprovalStatus).optional(),
    connectionStatus: z.nativeEnum(ReviewSourceConnectionStatus).optional(),
    externalAccountId: optionalNullableText(255),
    externalLocationId: optionalNullableText(255),
    permissionNotes: optionalNullableText(5000)
  })
  .strict();

export const updateReviewSourceSchema = createReviewSourceSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one review source field must be provided."
  });

export type ListReviewSourcesInput = z.infer<typeof listReviewSourcesQuerySchema> & {
  restaurantId: string;
};

export type CreateReviewSourceInput = z.infer<typeof createReviewSourceSchema>;
export type UpdateReviewSourceInput = z.infer<typeof updateReviewSourceSchema>;

function searchParamsToObject(searchParams: URLSearchParams): Record<string, string> {
  return Object.fromEntries(searchParams.entries());
}

export function parseListReviewSourcesQuery(searchParams: URLSearchParams) {
  return listReviewSourcesQuerySchema.parse(searchParamsToObject(searchParams));
}

async function assertRestaurantBelongsToAgency(
  context: RequestContext,
  restaurantId: string
): Promise<void> {
  const restaurant = await prisma.restaurant.findFirst({
    where: {
      id: restaurantId,
      agencyId: context.agencyId,
      deletedAt: null
    },
    select: {
      id: true
    }
  });

  if (!restaurant) {
    throw notFound("Restaurant not found.");
  }
}

async function assertLocationBelongsToRestaurant(
  context: RequestContext,
  restaurantId: string,
  locationId: string
): Promise<void> {
  const location = await prisma.location.findFirst({
    where: {
      id: locationId,
      agencyId: context.agencyId,
      restaurantId,
      deletedAt: null
    },
    select: {
      id: true
    }
  });

  if (!location) {
    throw badRequest("Location must belong to the selected restaurant and agency.");
  }
}

async function getActiveReviewSource(
  context: RequestContext,
  reviewSourceId: string
): Promise<Pick<ReviewSourceResponse, "id" | "restaurantId" | "deletedAt">> {
  const reviewSource = await prisma.reviewSource.findFirst({
    where: {
      id: reviewSourceId,
      agencyId: context.agencyId,
      deletedAt: null
    },
    select: {
      id: true,
      restaurantId: true,
      deletedAt: true
    }
  });

  if (!reviewSource) {
    throw notFound("Review source not found.");
  }

  if (!reviewSource.restaurantId) {
    throw badRequest("Review source must belong to a restaurant.");
  }

  return reviewSource;
}

export async function listReviewSources(
  context: RequestContext,
  input: ListReviewSourcesInput
): Promise<ReviewSourceResponse[]> {
  await assertRestaurantBelongsToAgency(context, input.restaurantId);

  if (input.locationId) {
    await assertLocationBelongsToRestaurant(context, input.restaurantId, input.locationId);
  }

  return prisma.reviewSource.findMany({
    where: {
      agencyId: context.agencyId,
      restaurantId: input.restaurantId,
      ...(input.locationId ? { locationId: input.locationId } : {}),
      ...(input.includeArchived ? {} : { deletedAt: null })
    },
    orderBy: [{ name: "asc" }, { createdAt: "desc" }],
    select: reviewSourceSelect
  });
}

export async function createReviewSource(
  context: RequestContext,
  restaurantId: string,
  input: CreateReviewSourceInput
): Promise<ReviewSourceResponse> {
  await assertRestaurantBelongsToAgency(context, restaurantId);

  if (input.locationId) {
    await assertLocationBelongsToRestaurant(context, restaurantId, input.locationId);
  }

  return prisma.reviewSource.create({
    data: {
      agencyId: context.agencyId,
      restaurantId,
      locationId: input.locationId ?? null,
      name: input.name,
      sourceType: input.sourceType,
      approvalStatus: input.approvalStatus,
      connectionStatus: input.connectionStatus,
      externalAccountId: input.externalAccountId ?? null,
      externalLocationId: input.externalLocationId ?? null,
      permissionNotes: input.permissionNotes ?? null
    },
    select: reviewSourceSelect
  });
}

export async function updateReviewSource(
  context: RequestContext,
  reviewSourceId: string,
  input: UpdateReviewSourceInput
): Promise<ReviewSourceResponse> {
  const current = await getActiveReviewSource(context, reviewSourceId);
  const restaurantId = current.restaurantId;

  if (!restaurantId) {
    throw badRequest("Review source must belong to a restaurant.");
  }

  if (input.locationId) {
    await assertLocationBelongsToRestaurant(context, restaurantId, input.locationId);
  }

  const data: Prisma.ReviewSourceUncheckedUpdateInput = {};

  if (input.name !== undefined) {
    data.name = input.name;
  }

  if (input.locationId !== undefined) {
    data.locationId = input.locationId;
  }

  if (input.sourceType !== undefined) {
    data.sourceType = input.sourceType;
  }

  if (input.approvalStatus !== undefined) {
    data.approvalStatus = input.approvalStatus;
  }

  if (input.connectionStatus !== undefined) {
    data.connectionStatus = input.connectionStatus;
  }

  if (input.externalAccountId !== undefined) {
    data.externalAccountId = input.externalAccountId;
  }

  if (input.externalLocationId !== undefined) {
    data.externalLocationId = input.externalLocationId;
  }

  if (input.permissionNotes !== undefined) {
    data.permissionNotes = input.permissionNotes;
  }

  return prisma.reviewSource.update({
    where: {
      id_agencyId: {
        id: reviewSourceId,
        agencyId: context.agencyId
      }
    },
    data,
    select: reviewSourceSelect
  });
}

export async function archiveReviewSource(
  context: RequestContext,
  reviewSourceId: string
): Promise<ReviewSourceResponse> {
  await getActiveReviewSource(context, reviewSourceId);

  return prisma.reviewSource.update({
    where: {
      id_agencyId: {
        id: reviewSourceId,
        agencyId: context.agencyId
      }
    },
    data: {
      connectionStatus: ReviewSourceConnectionStatus.DISCONNECTED,
      nextSyncAt: null,
      deletedAt: new Date()
    },
    select: reviewSourceSelect
  });
}
