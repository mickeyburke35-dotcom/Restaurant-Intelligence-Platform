import { notFound } from "next/navigation";
import { createLocationAction } from "@/app/restaurants/actions";
import { LocationForm } from "@/app/restaurants/location-form";
import { canManageRestaurants, getActiveAgencyContext } from "@/lib/request-context";
import { getTenantRestaurant } from "@/lib/restaurants";

export const dynamic = "force-dynamic";

type NewLocationPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function PermissionNotice() {
  return (
    <main className="min-h-screen bg-canvas px-5 py-8 text-ink sm:px-8">
      <section className="mx-auto max-w-3xl rounded-md border border-line bg-panel p-6 shadow-soft">
        <h1 className="text-xl font-semibold">Location creation is restricted</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Ask an agency owner, admin, or manager to create restaurant locations for this
          workspace.
        </p>
      </section>
    </main>
  );
}

export default async function NewLocationPage({ params }: NewLocationPageProps) {
  const { id } = await params;
  const context = await getActiveAgencyContext();
  const restaurant = await getTenantRestaurant(context, id);

  if (!restaurant) {
    notFound();
  }

  if (!canManageRestaurants(context)) {
    return <PermissionNotice />;
  }

  const action = createLocationAction.bind(null, restaurant.id);

  return (
    <main className="min-h-screen bg-canvas px-5 py-8 text-ink sm:px-8">
      <LocationForm
        action={action}
        backHref={`/restaurants/${restaurant.id}/locations`}
        submitLabel="Create location"
        title="Create location"
        description={`Add a location under ${restaurant.name}. Reviews, dashboards, AI storage, and reports are not part of this step.`}
      />
    </main>
  );
}
