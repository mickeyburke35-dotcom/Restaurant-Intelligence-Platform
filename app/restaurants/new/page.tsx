import { createRestaurantAction } from "@/app/restaurants/actions";
import { RestaurantForm } from "@/app/restaurants/restaurant-form";
import { canManageRestaurants, getActiveAgencyContext } from "@/lib/request-context";

export const dynamic = "force-dynamic";

function PermissionNotice() {
  return (
    <main className="min-h-screen bg-canvas px-5 py-8 text-ink sm:px-8">
      <section className="mx-auto max-w-3xl rounded-md border border-line bg-panel p-6 shadow-soft">
        <h1 className="text-xl font-semibold">Restaurant creation is restricted</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Ask an agency owner, admin, or manager to create restaurant clients for this workspace.
        </p>
      </section>
    </main>
  );
}

export default async function NewRestaurantPage() {
  const context = await getActiveAgencyContext();

  if (!canManageRestaurants(context)) {
    return <PermissionNotice />;
  }

  return (
    <main className="min-h-screen bg-canvas px-5 py-8 text-ink sm:px-8">
      <RestaurantForm
        action={createRestaurantAction}
        submitLabel="Create restaurant"
        title="Create restaurant"
        description={`Add a restaurant client inside ${context.agencyName}. Locations can be added after the restaurant profile is created.`}
      />
    </main>
  );
}
