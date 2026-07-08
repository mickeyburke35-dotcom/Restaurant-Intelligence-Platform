import { notFound } from "next/navigation";
import { updateLocationAction } from "@/app/restaurants/actions";
import { LocationForm } from "@/app/restaurants/location-form";
import { canManageRestaurants, getActiveAgencyContext } from "@/lib/request-context";
import { getTenantLocation } from "@/lib/locations";
import { getTenantRestaurant } from "@/lib/restaurants";

export const dynamic = "force-dynamic";

type EditLocationPageProps = {
  params: Promise<{
    id: string;
    locationId: string;
  }>;
};

function PermissionNotice() {
  return (
    <main className="min-h-screen bg-canvas px-5 py-8 text-ink sm:px-8">
      <section className="mx-auto max-w-3xl rounded-md border border-line bg-panel p-6 shadow-soft">
        <h1 className="text-xl font-semibold">Location editing is restricted</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Ask an agency owner, admin, or manager to edit restaurant locations for this
          workspace.
        </p>
      </section>
    </main>
  );
}

export default async function EditLocationPage({ params }: EditLocationPageProps) {
  const { id, locationId } = await params;
  const context = await getActiveAgencyContext();
  const restaurant = await getTenantRestaurant(context, id);

  if (!restaurant) {
    notFound();
  }

  const location = await getTenantLocation(context, restaurant.id, locationId);

  if (!location) {
    notFound();
  }

  if (!canManageRestaurants(context)) {
    return <PermissionNotice />;
  }

  const action = updateLocationAction.bind(null, restaurant.id, location.id);

  return (
    <main className="min-h-screen bg-canvas px-5 py-8 text-ink sm:px-8">
      <LocationForm
        action={action}
        backHref={`/restaurants/${restaurant.id}/locations`}
        initialValues={{
          name: location.name,
          addressLine1: location.addressLine1 ?? "",
          addressLine2: location.addressLine2 ?? "",
          city: location.city ?? "",
          region: location.region ?? "",
          postalCode: location.postalCode ?? "",
          country: location.country,
          timezone: location.timezone,
          latitude: location.latitude?.toString() ?? "",
          longitude: location.longitude?.toString() ?? "",
          status: location.status
        }}
        submitLabel="Save location"
        title="Edit location"
        description={`Update ${location.name} under ${restaurant.name}.`}
      />
    </main>
  );
}
