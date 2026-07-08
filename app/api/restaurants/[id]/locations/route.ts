import { NextResponse } from "next/server";
import { apiErrorResponse, validationErrorResponse } from "@/lib/api-errors";
import {
  locationListFilterSchema,
  locationPayloadSchema
} from "@/lib/location-validation";
import { getActiveAgencyContext } from "@/lib/request-context";
import { createTenantLocation, listTenantLocations } from "@/lib/locations";

export const dynamic = "force-dynamic";

type RestaurantLocationsRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: RestaurantLocationsRouteProps) {
  const url = new URL(request.url);
  const filters = locationListFilterSchema.safeParse({
    q: url.searchParams.get("q") ?? undefined,
    status: url.searchParams.get("status") ?? undefined
  });

  if (!filters.success) {
    return validationErrorResponse(filters.error);
  }

  try {
    const { id } = await params;
    const context = await getActiveAgencyContext();
    const locations = await listTenantLocations(context, id, filters.data);

    return NextResponse.json({
      locations
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request, { params }: RestaurantLocationsRouteProps) {
  try {
    const { id } = await params;
    const payload = locationPayloadSchema.parse(await request.json());
    const context = await getActiveAgencyContext();
    const location = await createTenantLocation(context, id, payload);

    return NextResponse.json(
      {
        location
      },
      {
        status: 201
      }
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
