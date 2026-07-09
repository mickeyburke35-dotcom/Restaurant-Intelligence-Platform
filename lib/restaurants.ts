import { Prisma, RestaurantStatus } from "@prisma/client";
import {
  assertCanManageRestaurants,
  type AgencyRequestContext
} from "@/lib/request-context";
import { prisma } from "@/lib/prisma";
import type { RestaurantListFilters, RestaurantPayload } from "@/lib/restaurant-validation";

export class RestaurantNotFoundError extends Error {
  constructor() {
    super("Restaurant was not found for this agency.");
    this.name = "RestaurantNotFoundError";
  }
}

const restaurantSelect = {
  id: true,
  agencyId: true,
  name: true,
  slug: true,
  segment: true,
  cuisine: true,
  websiteUrl: true,
  notes: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true
} satisfies Prisma.RestaurantSelect;

export type RestaurantRecord = Prisma.RestaurantGetPayload<{
  select: typeof restaurantSelect;
}>;

function nullableValue(value: string | undefined): string | null {
  return value ?? null;
}

function slugifyRestaurantName(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug.length > 0 ? slug : "restaurant";
}

async function buildUniqueRestaurantSlug(
  agencyId: string,
  name: string,
  existingRestaurantId?: string
): Promise<string> {
  const baseSlug = slugifyRestaurantName(name);

  for (let suffix = 0; suffix < 100; suffix += 1) {
    const suffixText = suffix === 0 ? "" : `-${suffix + 1}`;
    const baseLength = 80 - suffixText.length;
    const candidate = `${baseSlug.slice(0, baseLength)}${suffixText}`;

    const matchingRestaurant = await prisma.restaurant.findFirst({
      where: {
        agencyId,
        slug: candidate,
        ...(existingRestaurantId
          ? {
              id: {
                not: existingRestaurantId
              }
            }
          : {})
      },
      select: {
        id: true
      }
    });

    if (!matchingRestaurant) {
      return candidate;
    }
  }

  throw new Error("Unable to create a unique restaurant slug.");
}

function restaurantScopeWhere(context: AgencyRequestContext): Prisma.RestaurantWhereInput {
  return {
    agencyId: context.agencyId,
    ...(context.restaurantId
      ? {
          id: context.restaurantId
        }
      : {})
  };
}

export async function listTenantRestaurants(
  context: AgencyRequestContext,
  filters: RestaurantListFilters
): Promise<RestaurantRecord[]> {
  const statusWhere: Prisma.RestaurantWhereInput =
    filters.status === RestaurantStatus.ARCHIVED
      ? {
          status: RestaurantStatus.ARCHIVED
        }
      : {
          deletedAt: null,
          status:
            filters.status === "ALL"
              ? {
                  not: RestaurantStatus.ARCHIVED
                }
              : filters.status
        };

  const searchWhere: Prisma.RestaurantWhereInput = filters.q
    ? {
        OR: [
          {
            name: {
              contains: filters.q,
              mode: "insensitive"
            }
          },
          {
            segment: {
              contains: filters.q,
              mode: "insensitive"
            }
          },
          {
            cuisine: {
              contains: filters.q,
              mode: "insensitive"
            }
          }
        ]
      }
    : {};

  return prisma.restaurant.findMany({
    where: {
      ...restaurantScopeWhere(context),
      ...statusWhere,
      ...searchWhere
    },
    select: restaurantSelect,
    orderBy: [
      {
        updatedAt: "desc"
      },
      {
        name: "asc"
      }
    ]
  });
}

export async function getTenantRestaurant(
  context: AgencyRequestContext,
  restaurantId: string
): Promise<RestaurantRecord | null> {
  return prisma.restaurant.findFirst({
    where: {
      ...restaurantScopeWhere(context),
      id: restaurantId,
      deletedAt: null,
      status: {
        not: RestaurantStatus.ARCHIVED
      }
    },
    select: restaurantSelect
  });
}

export async function createTenantRestaurant(
  context: AgencyRequestContext,
  payload: RestaurantPayload
): Promise<RestaurantRecord> {
  assertCanManageRestaurants(context);

  const slug = await buildUniqueRestaurantSlug(context.agencyId, payload.name);

  return prisma.restaurant.create({
    data: {
      agencyId: context.agencyId,
      name: payload.name,
      slug,
      segment: nullableValue(payload.segment),
      cuisine: nullableValue(payload.cuisine),
      websiteUrl: nullableValue(payload.websiteUrl),
      notes: nullableValue(payload.notes),
      status: payload.status
    },
    select: restaurantSelect
  });
}

export async function updateTenantRestaurant(
  context: AgencyRequestContext,
  restaurantId: string,
  payload: RestaurantPayload
): Promise<RestaurantRecord> {
  assertCanManageRestaurants(context);

  const existingRestaurant = await getTenantRestaurant(context, restaurantId);

  if (!existingRestaurant) {
    throw new RestaurantNotFoundError();
  }

  const slug = await buildUniqueRestaurantSlug(context.agencyId, payload.name, restaurantId);

  return prisma.restaurant.update({
    where: {
      id_agencyId: {
        id: restaurantId,
        agencyId: context.agencyId
      }
    },
    data: {
      name: payload.name,
      slug,
      segment: nullableValue(payload.segment),
      cuisine: nullableValue(payload.cuisine),
      websiteUrl: nullableValue(payload.websiteUrl),
      notes: nullableValue(payload.notes),
      status: payload.status,
      deletedAt: null
    },
    select: restaurantSelect
  });
}

export async function archiveTenantRestaurant(
  context: AgencyRequestContext,
  restaurantId: string
): Promise<RestaurantRecord> {
  assertCanManageRestaurants(context);

  const existingRestaurant = await getTenantRestaurant(context, restaurantId);

  if (!existingRestaurant) {
    throw new RestaurantNotFoundError();
  }

  return prisma.restaurant.update({
    where: {
      id_agencyId: {
        id: restaurantId,
        agencyId: context.agencyId
      }
    },
    data: {
      status: RestaurantStatus.ARCHIVED,
      deletedAt: new Date()
    },
    select: restaurantSelect
  });
}
