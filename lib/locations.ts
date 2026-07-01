import { LocationStatus, Prisma } from "@prisma/client";
import {
  assertCanManageRestaurants,
  type AgencyRequestContext
} from "@/lib/request-context";
import { prisma } from "@/lib/prisma";
import { getTenantRestaurant, RestaurantNotFoundError } from "@/lib/restaurants";
import type { LocationListFilters, LocationPayload } from "@/lib/location-validation";

export class LocationNotFoundError extends Error {
  constructor() {
    super("Location was not found for this restaurant.");
    this.name = "LocationNotFoundError";
  }
}

const locationSelect = {
  id: true,
  agencyId: true,
  restaurantId: true,
  name: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  region: true,
  postalCode: true,
  country: true,
  timezone: true,
  latitude: true,
  longitude: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true
} satisfies Prisma.LocationSelect;

export type LocationRecord = Prisma.LocationGetPayload<{
  select: typeof locationSelect;
}>;

function nullableValue(value: string | undefined): string | null {
  return value ?? null;
}

function nullableCoordinate(value: number | undefined): number | null {
  return value ?? null;
}

async function assertRestaurantInScope(
  context: AgencyRequestContext,
  restaurantId: string
): Promise<void> {
  const restaurant = await getTenantRestaurant(context, restaurantId);

  if (!restaurant) {
    throw new RestaurantNotFoundError();
  }
}

function locationScopeWhere(
  context: AgencyRequestContext,
  restaurantId: string
): Prisma.LocationWhereInput {
  return {
    agencyId: context.agencyId,
    restaurantId
  };
}

export async function listTenantLocations(
  context: AgencyRequestContext,
  restaurantId: string,
  filters: LocationListFilters
): Promise<LocationRecord[]> {
  await assertRestaurantInScope(context, restaurantId);

  const statusWhere: Prisma.LocationWhereInput =
    filters.status === LocationStatus.ARCHIVED
      ? {
          status: LocationStatus.ARCHIVED
        }
      : {
          deletedAt: null,
          status:
            filters.status === "ALL"
              ? {
                  not: LocationStatus.ARCHIVED
                }
              : filters.status
        };

  const searchWhere: Prisma.LocationWhereInput = filters.q
    ? {
        OR: [
          {
            name: {
              contains: filters.q,
              mode: "insensitive"
            }
          },
          {
            city: {
              contains: filters.q,
              mode: "insensitive"
            }
          },
          {
            region: {
              contains: filters.q,
              mode: "insensitive"
            }
          }
        ]
      }
    : {};

  return prisma.location.findMany({
    where: {
      ...locationScopeWhere(context, restaurantId),
      ...statusWhere,
      ...searchWhere
    },
    select: locationSelect,
    orderBy: [
      {
        name: "asc"
      }
    ]
  });
}

export async function getTenantLocation(
  context: AgencyRequestContext,
  restaurantId: string,
  locationId: string
): Promise<LocationRecord | null> {
  await assertRestaurantInScope(context, restaurantId);

  return prisma.location.findFirst({
    where: {
      ...locationScopeWhere(context, restaurantId),
      id: locationId,
      deletedAt: null,
      status: {
        not: LocationStatus.ARCHIVED
      }
    },
    select: locationSelect
  });
}

export async function createTenantLocation(
  context: AgencyRequestContext,
  restaurantId: string,
  payload: LocationPayload
): Promise<LocationRecord> {
  assertCanManageRestaurants(context);
  await assertRestaurantInScope(context, restaurantId);

  return prisma.location.create({
    data: {
      agencyId: context.agencyId,
      restaurantId,
      name: payload.name,
      addressLine1: nullableValue(payload.addressLine1),
      addressLine2: nullableValue(payload.addressLine2),
      city: nullableValue(payload.city),
      region: nullableValue(payload.region),
      postalCode: nullableValue(payload.postalCode),
      country: payload.country,
      timezone: payload.timezone,
      latitude: nullableCoordinate(payload.latitude),
      longitude: nullableCoordinate(payload.longitude),
      status: payload.status
    },
    select: locationSelect
  });
}

export async function updateTenantLocation(
  context: AgencyRequestContext,
  restaurantId: string,
  locationId: string,
  payload: LocationPayload
): Promise<LocationRecord> {
  assertCanManageRestaurants(context);

  const existingLocation = await getTenantLocation(context, restaurantId, locationId);

  if (!existingLocation) {
    throw new LocationNotFoundError();
  }

  return prisma.location.update({
    where: {
      id_agencyId: {
        id: locationId,
        agencyId: context.agencyId
      }
    },
    data: {
      name: payload.name,
      addressLine1: nullableValue(payload.addressLine1),
      addressLine2: nullableValue(payload.addressLine2),
      city: nullableValue(payload.city),
      region: nullableValue(payload.region),
      postalCode: nullableValue(payload.postalCode),
      country: payload.country,
      timezone: payload.timezone,
      latitude: nullableCoordinate(payload.latitude),
      longitude: nullableCoordinate(payload.longitude),
      status: payload.status,
      deletedAt: null
    },
    select: locationSelect
  });
}

export async function archiveTenantLocation(
  context: AgencyRequestContext,
  restaurantId: string,
  locationId: string
): Promise<LocationRecord> {
  assertCanManageRestaurants(context);

  const existingLocation = await getTenantLocation(context, restaurantId, locationId);

  if (!existingLocation) {
    throw new LocationNotFoundError();
  }

  return prisma.location.update({
    where: {
      id_agencyId: {
        id: locationId,
        agencyId: context.agencyId
      }
    },
    data: {
      status: LocationStatus.ARCHIVED,
      deletedAt: new Date()
    },
    select: locationSelect
  });
}
