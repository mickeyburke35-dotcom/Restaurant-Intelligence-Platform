import { LocationStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { archiveLocationAction } from "@/app/restaurants/actions";
import { DemoHubLink } from "@/components/demo-hub-link";
import { locationListFilterSchema } from "@/lib/location-validation";
import { listTenantLocations, type LocationRecord } from "@/lib/locations";
import {
  canManageRestaurants,
  getActiveAgencyContext,
  type AgencyRequestContext
} from "@/lib/request-context";
import { getTenantRestaurant, type RestaurantRecord } from "@/lib/restaurants";

export const dynamic = "force-dynamic";

type LocationsPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
  }>;
};

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function formatStatus(status: LocationStatus): string {
  const labels: Record<LocationStatus, string> = {
    [LocationStatus.ACTIVE]: "Active",
    [LocationStatus.PAUSED]: "Paused",
    [LocationStatus.CLOSED]: "Closed",
    [LocationStatus.ARCHIVED]: "Archived"
  };

  return labels[status];
}

function statusBadgeClass(status: LocationStatus): string {
  const classes: Record<LocationStatus, string> = {
    [LocationStatus.ACTIVE]: "border-positive/30 bg-positive/10 text-positive",
    [LocationStatus.PAUSED]: "border-mixed/30 bg-mixed/10 text-mixed",
    [LocationStatus.CLOSED]: "border-neutral/30 bg-neutral/10 text-neutral",
    [LocationStatus.ARCHIVED]: "border-muted/30 bg-muted/10 text-muted"
  };

  return classes[status];
}

function formatAddress(location: LocationRecord): string {
  const parts = [
    location.addressLine1,
    location.addressLine2,
    location.city,
    location.region,
    location.postalCode,
    location.country
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "No address recorded";
}

function LocationEmptyState({
  canManage,
  hasActiveFilters,
  restaurant
}: {
  canManage: boolean;
  hasActiveFilters: boolean;
  restaurant: RestaurantRecord;
}) {
  return (
    <div className="rounded-md border border-dashed border-line bg-panel px-6 py-12 text-center">
      <h2 className="text-lg font-semibold text-ink">
        {hasActiveFilters ? "No locations match these filters" : "No locations found"}
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted">
        {hasActiveFilters
          ? "Reset the search or status filter to return to the full location list for this restaurant."
          : "Add a location to organize this restaurant client by market, city, or storefront. Reviews, AI insights, dashboards, and reports stay out of this setup step."}
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {hasActiveFilters ? (
          <Link
            href={`/restaurants/${restaurant.id}/locations`}
            className="inline-flex h-10 w-full items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-pine hover:text-pine focus:outline-none focus:ring-2 focus:ring-lichen focus:ring-offset-2 sm:w-fit"
          >
            Reset filters
          </Link>
        ) : null}
        {canManage ? (
          <Link
            href={`/restaurants/${restaurant.id}/locations/new`}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-pine px-4 text-sm font-semibold text-white transition hover:bg-pine-dark focus:outline-none focus:ring-2 focus:ring-lichen focus:ring-offset-2 sm:w-fit"
          >
            Create location
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function ArchiveLocationButton({
  location,
  restaurant
}: {
  location: LocationRecord;
  restaurant: RestaurantRecord;
}) {
  const archiveAction = archiveLocationAction.bind(null, restaurant.id, location.id);

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

function LocationTable({
  canManage,
  locations,
  restaurant
}: {
  canManage: boolean;
  locations: LocationRecord[];
  restaurant: RestaurantRecord;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-panel shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead className="bg-snow text-xs uppercase text-muted">
            <tr>
              <th className="border-b border-line px-4 py-3 font-semibold">Location</th>
              <th className="border-b border-line px-4 py-3 font-semibold">Address</th>
              <th className="border-b border-line px-4 py-3 font-semibold">Timezone</th>
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
            {locations.map((location) => (
              <tr key={location.id} className="transition hover:bg-snow">
                <td className="border-b border-line px-4 py-4 align-top">
                  <div className="font-semibold text-ink">{location.name}</div>
                  <p className="mt-1 text-xs text-muted">{location.country}</p>
                </td>
                <td className="border-b border-line px-4 py-4 align-top text-muted">
                  {formatAddress(location)}
                </td>
                <td className="border-b border-line px-4 py-4 align-top text-muted">
                  {location.timezone}
                </td>
                <td className="border-b border-line px-4 py-4 align-top">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(
                      location.status
                    )}`}
                  >
                    {formatStatus(location.status)}
                  </span>
                </td>
                <td className="border-b border-line px-4 py-4 align-top text-muted">
                  {new Intl.DateTimeFormat("en", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  }).format(location.updatedAt)}
                </td>
                {canManage ? (
                  <td className="border-b border-line px-4 py-4 align-top">
                    <div className="flex justify-end gap-2">
                      {location.status !== LocationStatus.ARCHIVED ? (
                        <>
                          <Link
                            href={`/restaurants/${restaurant.id}/locations/${location.id}/edit`}
                            className="rounded-md border border-line px-3 py-2 text-xs font-semibold text-ink transition hover:border-pine hover:text-pine focus:outline-none focus:ring-2 focus:ring-lichen"
                          >
                            Edit
                          </Link>
                          <ArchiveLocationButton location={location} restaurant={restaurant} />
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
          Search locations
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
          <option value="ALL">Active, paused, and closed</option>
          <option value={LocationStatus.ACTIVE}>Active</option>
          <option value={LocationStatus.PAUSED}>Paused</option>
          <option value={LocationStatus.CLOSED}>Closed</option>
          <option value={LocationStatus.ARCHIVED}>Archived</option>
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

function LocationPageShell({
  context,
  filters,
  locations,
  restaurant
}: {
  context: AgencyRequestContext;
  filters: { q: string; status: string };
  locations: LocationRecord[];
  restaurant: RestaurantRecord;
}) {
  const canManage = canManageRestaurants(context);
  const hasActiveFilters = Boolean(filters.q || filters.status !== "ALL");

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8">
        <header className="flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <DemoHubLink />
              <Link
                href="/restaurants"
                className="inline-flex h-9 w-fit items-center justify-center rounded-md border border-line bg-panel px-3 text-xs font-semibold text-muted transition hover:border-pine hover:text-pine focus:outline-none focus:ring-2 focus:ring-lichen focus:ring-offset-2"
              >
                Back to restaurants
              </Link>
            </div>
            <h1 className="mt-3 text-2xl font-semibold text-ink">
              {restaurant.name} locations
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Manage the restaurant locations attached to this agency-scoped client.
              Reviews, dashboards, AI storage, and reports are not part of this step.
            </p>
          </div>
          {canManage ? (
            <Link
              href={`/restaurants/${restaurant.id}/locations/new`}
              className="inline-flex h-10 items-center justify-center rounded-md bg-pine px-4 text-sm font-semibold text-white transition hover:bg-pine-dark focus:outline-none focus:ring-2 focus:ring-lichen focus:ring-offset-2"
            >
              Create location
            </Link>
          ) : null}
        </header>

        <SearchAndFilter q={filters.q} status={filters.status} />

        {locations.length > 0 ? (
          <LocationTable canManage={canManage} locations={locations} restaurant={restaurant} />
        ) : (
          <LocationEmptyState
            canManage={canManage}
            hasActiveFilters={hasActiveFilters}
            restaurant={restaurant}
          />
        )}
      </div>
    </main>
  );
}

export default async function LocationsPage({ params, searchParams }: LocationsPageProps) {
  const [{ id }, queryParams] = await Promise.all([params, searchParams]);
  const parsedFilters = locationListFilterSchema.safeParse({
    q: firstSearchParam(queryParams.q),
    status: firstSearchParam(queryParams.status)
  });
  const filters = parsedFilters.success
    ? parsedFilters.data
    : locationListFilterSchema.parse({});
  const context = await getActiveAgencyContext();
  const restaurant = await getTenantRestaurant(context, id);

  if (!restaurant) {
    notFound();
  }

  const locations = await listTenantLocations(context, restaurant.id, filters);

  return (
    <LocationPageShell
      context={context}
      filters={{
        q: filters.q ?? "",
        status: filters.status
      }}
      locations={locations}
      restaurant={restaurant}
    />
  );
}
