import { NextResponse } from "next/server";
import { apiErrorResponse, validationErrorResponse } from "@/lib/api-errors";
import { getActiveAgencyContext } from "@/lib/request-context";
import { createTenantRestaurant, listTenantRestaurants } from "@/lib/restaurants";
import {
  restaurantListFilterSchema,
  restaurantPayloadSchema
} from "@/lib/restaurant-validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filters = restaurantListFilterSchema.safeParse({
    q: url.searchParams.get("q") ?? undefined,
    status: url.searchParams.get("status") ?? undefined
  });

  if (!filters.success) {
    return validationErrorResponse(filters.error);
  }

  try {
    const context = await getActiveAgencyContext();
    const restaurants = await listTenantRestaurants(context, filters.data);

    return NextResponse.json({
      agency: {
        id: context.agencyId,
        name: context.agencyName
      },
      restaurants
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = restaurantPayloadSchema.parse(await request.json());
    const context = await getActiveAgencyContext();
    const restaurant = await createTenantRestaurant(context, payload);

    return NextResponse.json(
      {
        restaurant
      },
      {
        status: 201
      }
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
