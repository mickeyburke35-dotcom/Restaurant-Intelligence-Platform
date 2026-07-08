import { RestaurantStatus, type MembershipRole } from "@prisma/client";
import Link from "next/link";
import { archiveRestaurantAction } from "@/app/restaurants/actions";
import { DemoHubLink } from "@/components/demo-hub-link";
import {
  canManageRestaurants,
  getActiveAgencyContext,
  type AgencyRequestContext
} from "@/lib/request-context";
import { listTenantRestaurants, type RestaurantRecord } from "@/lib/restaurants";
import { restaurantListFilterSchema } from "@/lib/restaurant-validation";

export const dynamic = "force-dynamic";

type RestaurantPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
  }>;
};

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function formatStatus(status: RestaurantStatus): string {
  const labels: Record<RestaurantStatus, string> = {
    [RestaurantStatus.ACTIVE]: "Active",
    [RestaurantStatus.PAUSED]: "Paused",
    [RestaurantStatus.ARCHIVED]: "Archived"
  };

  return labels[status];
}

function statusBadgeClass(status: RestaurantStatus): string {
  const classes: Record<RestaurantStatus, string> = {
    [RestaurantStatus.ACTIVE]: "border-positive/30 bg-positive/10 text-positive",
    [RestaurantStatus.PAUSED]: "border-mixed/30 bg-mixed/10 text-mixed",
    [RestaurantStatus.ARCHIVED]: "border-muted/30 bg-muted/10 text-muted"
  };

  return classes[status];
}

function roleLabel(role: MembershipRole): string {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function RestaurantsEmptyState({ canManage }: { canManage: boolean }) {
  return (
    <div className="rounded-md border border-dashed border-line bg-panel px-6 py-12 text-center">
      <h2 className="text-lg font-semibold text-ink">No restaurants found</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted">
        Add a restaurant client to begin organizing agency-scoped review intelligence. Locations,
        reviews, AI insights, and reports stay out of this setup step.
      </p>
      {canManage ? (
        <Link
          href="/restaurants/new"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-pine px-4 text-sm font-semibold text-white transition hover:bg-pine-dark focus:outline-none focus:ring-2 focus:ring-lichen focus:ring-offset-2"
        >
          Create restaurant
        </Link>
      ) : null}
    </div>
  );
}

function ArchiveButton({ restaurant }: { restaurant: RestaurantRecord }) {
  const archiveAction = archiveRestaurantAction.bind(null, restaurant.id);

  return (
    <form action={archiveAction}>
      <button
        type="submit"
        className="rounded-md border border-negative/30 px-3 py-2 text-xs font-semibold text-negative transition hover:bg-negative/10 focus:outline-none focus:ring-2 focus:ring-lichen"
      >
        Archive
      </button>
    </form>
  );
}

function RestaurantTable({
  restaurants,
  canManage
}: {
  restaurants: RestaurantRecord[];
  canManage: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-panel shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead className="bg-snow text-xs uppercase text-muted">
            <tr>
              <th className="border-b border-line px-4 py-3 font-semibold">Restaurant</th>
              <th className="border-b border-line px-4 py-3 font-semibold">Segment</th>
              <th className="border-b border-line px-4 py-3 font-semibold">Cuisine</th>
              <th className="border-b border-line px-4 py-3 font-semibold">Status</th>
              <th className="border-b border-line px-4 py-3 font-semibold">Updated</th>
              {canManage ? (
                <th className="border-b border-line px-4 py-3 text-right font-semibold">
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {restaurants.map((restaurant) => (
              <tr key={restaurant.id} className="transition hover:bg-snow">
                <td className="border-b border-line px-4 py-4 align-top">
                  <div className="font-semibold text-ink">{restaurant.name}</div>
                  {restaurant.websiteUrl ? (
                    <a
                      href={restaurant.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-xs font-medium text-pine hover:text-pine-dark"
                    >
                      Website
                    </a>
                  ) : (
                    <p className="mt-1 text-xs text-muted">No website recorded</p>
                  )}
                </td>
                <td className="border-b border-line px-4 py-4 align-top text-muted">
                  {restaurant.segment ?? "Not set"}
                </td>
                <td className="border-b border-line px-4 py-4 align-top text-muted">
                  {restaurant.cuisine ?? "Not set"}
                </td>
                <td className="border-b border-line px-4 py-4 align-top">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(
                      restaurant.status
                    )}`}
                  >
                    {formatStatus(restaurant.status)}
                  </span>
                </td>
                <td className="border-b border-line px-4 py-4 align-top text-muted">
                  {new Intl.DateTimeFormat("en", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  }).format(restaurant.updatedAt)}
                </td>
                {canManage ? (
                  <td className="border-b border-line px-4 py-4 align-top">
                    <div className="flex justify-end gap-2">
                      {restaurant.status !== RestaurantStatus.ARCHIVED ? (
                        <>
                          <Link
                            href={`/restaurants/${restaurant.id}/locations`}
                            className="rounded-md border border-line px-3 py-2 text-xs font-semibold text-ink transition hover:border-pine hover:text-pine focus:outline-none focus:ring-2 focus:ring-lichen"
                          >
                            Locations
                          </Link>
                          <Link
                            href={`/restaurants/${restaurant.id}/edit`}
                            className="rounded-md border border-line px-3 py-2 text-xs font-semibold text-ink transition hover:border-pine hover:text-pine focus:outline-none focus:ring-2 focus:ring-lichen"
                          >
                            Edit
                          </Link>
                          <ArchiveButton restaurant={restaurant} />
                        </>
                      ) : (
                        <span className="rounded-md border border-line px-3 py-2 text-xs font-semibold text-muted">
                          Archived
                        </span>
                      )}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SearchAndFilter({
  q,
  status
}: {
  q: string;
  status: string;
}) {
  return (
    <form className="grid gap-3 rounded-md border border-line bg-panel p-4 shadow-soft sm:grid-cols-[1fr_180px_auto] sm:items-end">
      <div>
        <label htmlFor="q" className="block text-sm font-semibold text-ink">
          Search restaurants
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          className="mt-2 h-10 w-full rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-lichen"
        />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-semibold text-ink">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={status}
          className="mt-2 h-10 w-full rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-lichen"
        >
          <option value="ALL">Active and paused</option>
          <option value={RestaurantStatus.ACTIVE}>Active</option>
          <option value={RestaurantStatus.PAUSED}>Paused</option>
          <option value={RestaurantStatus.ARCHIVED}>Archived</option>
        </select>
      </div>
      <button
        type="submit"
        className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-snow px-4 text-sm font-semibold text-ink transition hover:border-pine hover:text-pine focus:outline-none focus:ring-2 focus:ring-lichen"
      >
        Apply filters
      </button>
    </form>
  );
}

function RestaurantPageShell({
  context,
  restaurants,
  filters
}: {
  context: AgencyRequestContext;
  restaurants: RestaurantRecord[];
  filters: { q: string; status: string };
}) {
  const canManage = canManageRestaurants(context);

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8">
        <DemoHubLink />

        <header className="flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-pine">{context.agencyName}</p>
            <h1 className="mt-2 text-2xl font-semibold text-ink">Restaurant management</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Maintain agency-scoped restaurant clients and open a restaurant row to manage
              locations. Reviews, AI insights, and reports stay out of this setup step.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="rounded-md border border-line bg-panel px-3 py-2 text-xs font-semibold text-muted">
              {roleLabel(context.role)}
            </span>
            {canManage ? (
              <Link
                href="/restaurants/new"
                className="inline-flex h-10 items-center justify-center rounded-md bg-pine px-4 text-sm font-semibold text-white transition hover:bg-pine-dark focus:outline-none focus:ring-2 focus:ring-lichen focus:ring-offset-2"
              >
                Create restaurant
              </Link>
            ) : null}
          </div>
        </header>

        <SearchAndFilter q={filters.q} status={filters.status} />

        {restaurants.length > 0 ? (
          <RestaurantTable restaurants={restaurants} canManage={canManage} />
        ) : (
          <RestaurantsEmptyState canManage={canManage} />
        )}
      </div>
    </main>
  );
}

export default async function RestaurantsPage({ searchParams }: RestaurantPageProps) {
  const params = await searchParams;
  const parsedFilters = restaurantListFilterSchema.safeParse({
    q: firstSearchParam(params.q),
    status: firstSearchParam(params.status)
  });
  const filters = parsedFilters.success
    ? parsedFilters.data
    : restaurantListFilterSchema.parse({});
  const context = await getActiveAgencyContext();
  const restaurants = await listTenantRestaurants(context, filters);

  return (
    <RestaurantPageShell
      context={context}
      restaurants={restaurants}
      filters={{
        q: filters.q ?? "",
        status: filters.status
      }}
    />
  );
}
