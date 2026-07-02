import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api-errors";
import { locationPayloadSchema } from "@/lib/location-validation";
import {
  archiveTenantLocation,
  getTenantLocation,
  LocationNotFoundError,
  updateTenantLocation
} from "@/lib/locations";
import { getActiveAgencyContext } from "@/lib/request-context";

export const dynamic = "force-dynamic";

type RestaurantLocationRouteProps = {
  params: Promise<{
    id: string;
    locationId: string;
  }>;
};

export async function GET(_request: Request, { params }: RestaurantLocationRouteProps) {
  try {
    const { id, locationId } = await params;
    const context = await getActiveAgencyContext();
    const location = await getTenantLocation(context, id, locationId);

    if (!location) {
      throw new LocationNotFoundError();
    }

    return NextResponse.json({
      location
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: RestaurantLocationRouteProps) {
  try {
    const { id, locationId } = await params;
    const payload = locationPayloadSchema.parse(await request.json());
    const context = await getActiveAgencyContext();
    const location = await updateTenantLocation(context, id, locationId, payload);

    return NextResponse.json({
      location
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: RestaurantLocationRouteProps) {
  try {
    const { id, locationId } = await params;
    const context = await getActiveAgencyContext();
    const location = await archiveTenantLocation(context, id, locationId);

    return NextResponse.json({
      location
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
