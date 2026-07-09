import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api-errors";
import { getActiveAgencyContext } from "@/lib/request-context";
import {
  archiveTenantRestaurant,
  getTenantRestaurant,
  RestaurantNotFoundError,
  updateTenantRestaurant
} from "@/lib/restaurants";
import { restaurantPayloadSchema } from "@/lib/restaurant-validation";

export const dynamic = "force-dynamic";

type RestaurantRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: RestaurantRouteProps) {
  try {
    const { id } = await params;
    const context = await getActiveAgencyContext();
    const restaurant = await getTenantRestaurant(context, id);

    if (!restaurant) {
      throw new RestaurantNotFoundError();
    }

    return NextResponse.json({
      restaurant
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: RestaurantRouteProps) {
  try {
    const { id } = await params;
    const payload = restaurantPayloadSchema.parse(await request.json());
    const context = await getActiveAgencyContext();
    const restaurant = await updateTenantRestaurant(context, id, payload);

    return NextResponse.json({
      restaurant
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: RestaurantRouteProps) {
  try {
    const { id } = await params;
    const context = await getActiveAgencyContext();
    const restaurant = await archiveTenantRestaurant(context, id);

    return NextResponse.json({
      restaurant
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
