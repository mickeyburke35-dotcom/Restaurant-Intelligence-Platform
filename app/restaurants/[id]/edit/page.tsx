import { notFound } from "next/navigation";
import { updateRestaurantAction } from "@/app/restaurants/actions";
import { RestaurantForm } from "@/app/restaurants/restaurant-form";
import { canManageRestaurants, getActiveAgencyContext } from "@/lib/request-context";
import { getTenantRestaurant } from "@/lib/restaurants";

export const dynamic = "force-dynamic";

type EditRestaurantPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function PermissionNotice() {
  return (
    <main className="min-h-screen bg-canvas px-5 py-8 text-ink sm:px-8">
      <section className="mx-auto max-w-3xl rounded-md border border-line bg-panel p-6 shadow-soft">
        <h1 className="text-xl font-semibold">Restaurant editing is restricted</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Ask an agency owner, admin, or manager to edit restaurant clients for this workspace.
        </p>
      </section>
    </main>
  );
}

export default async function EditRestaurantPage({ params }: EditRestaurantPageProps) {
  const { id } = await params;
  const context = await getActiveAgencyContext();
  const restaurant = await getTenantRestaurant(context, id);

  if (!restaurant) {
    notFound();
  }

  if (!canManageRestaurants(context)) {
    return <PermissionNotice />;
  }

  const action = updateRestaurantAction.bind(null, restaurant.id);

  return (
    <main className="min-h-screen bg-canvas px-5 py-8 text-ink sm:px-8">
      <RestaurantForm
        action={action}
        initialValues={{
          name: restaurant.name,
          segment: restaurant.segment ?? "",
          cuisine: restaurant.cuisine ?? "",
          websiteUrl: restaurant.websiteUrl ?? "",
          notes: restaurant.notes ?? "",
          status: restaurant.status
        }}
        submitLabel="Save restaurant"
        title="Edit restaurant"
        description={`Update the agency-scoped restaurant profile for ${restaurant.name}.`}
      />
    </main>
  );
}
