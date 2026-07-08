import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Demo Hub | Restaurant Intelligence Platform",
  description:
    "Live MVP walkthrough path for Restaurant Intelligence Platform demonstrations."
};

const demoSteps = [
  {
    step: "01",
    title: "Workspace",
    description: "Confirm the signed-in agency, membership role, and current client scope.",
    href: "/workspace",
    routeLabel: "/workspace",
    suggestedAction: "Verify the active agency and role, then continue into the demo path."
  },
  {
    step: "02",
    title: "Restaurants",
    description: "Review the agency-scoped restaurant client list and management actions.",
    href: "/restaurants",
    routeLabel: "/restaurants",
    suggestedAction: "Search or filter clients, then open the Locations action on a restaurant row."
  },
  {
    step: "03",
    title: "Locations",
    description: "Inspect the restaurant-scoped location list for a selected client.",
    href: "/restaurants",
    routeLabel: "/restaurants",
    suggestedAction: "Start from Restaurants, choose Locations, and review location status and details."
  },
  {
    step: "04",
    title: "Review Import",
    description: "Preview and import approved public review CSV rows before dashboard use.",
    href: "/reviews/import",
    routeLabel: "/reviews/import",
    suggestedAction: "Paste or upload a CSV, confirm approved public data, and preview row readiness."
  },
  {
    step: "05",
    title: "Review Dashboard",
    description: "Review imported feedback with filters, sorting, pagination, and detail evidence.",
    href: "/reviews",
    routeLabel: "/reviews",
    suggestedAction: "Filter by restaurant, location, rating, sentiment, or source, then open a review."
  },
  {
    step: "06",
    title: "AI Insight Generation",
    description: "Generate draft insights from selected imported review evidence.",
    href: "/insights",
    routeLabel: "/insights",
    suggestedAction: "Select a restaurant and source reviews, then generate draft AI insights."
  },
  {
    step: "07",
    title: "AI Insight Approval",
    description: "Review evidence-linked draft insights before they become report-eligible.",
    href: "/insights",
    routeLabel: "/insights",
    suggestedAction: "Open a draft, inspect source excerpts and confidence, then approve or reject it."
  },
  {
    step: "08",
    title: "Reports",
    description: "Create stored report snapshots from approved insights and source review counts.",
    href: "/reports",
    routeLabel: "/reports",
    suggestedAction: "Check report eligibility, create a snapshot, and open a recent report."
  },
  {
    step: "09",
    title: "Competitor Observations",
    description: "Review manually entered competitor observations and market signal notes.",
    href: "/competitors",
    routeLabel: "/competitors",
    suggestedAction: "Select a restaurant and competitor, then review or add a permitted observation."
  }
] as const;

export default function DemoHubPage() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 lg:py-14">
        <header className="grid gap-6 border-b border-line pb-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-pine">
              Live MVP demo path
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-ink">
              Restaurant Intelligence Platform
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
              Follow these live product routes in order to show the completed MVP workflow from
              agency context through client-ready reporting and competitor observations.
            </p>
          </div>
          <div className="rounded-md border border-line bg-panel p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase text-muted">
              Walkthrough
            </p>
            <p className="mt-3 text-2xl font-semibold text-ink">{demoSteps.length} steps</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Each card links to an existing MVP route and includes a suggested presenter action.
            </p>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {demoSteps.map((card) => (
            <article
              className="flex min-h-72 flex-col justify-between rounded-md border border-line bg-panel p-5 shadow-soft"
              key={card.title}
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <p className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-line bg-snow px-2 text-xs font-semibold text-pine">
                    {card.step}
                  </p>
                  <Link
                    className="break-all text-right text-xs font-semibold text-muted transition hover:text-pine focus:outline-none focus:ring-2 focus:ring-lichen focus:ring-offset-2 focus:ring-offset-panel"
                    href={card.href}
                  >
                    {card.routeLabel}
                  </Link>
                </div>
                <h2 className="mt-5 text-xl font-semibold text-ink">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">{card.description}</p>
                <div className="mt-5 border-t border-line pt-4">
                  <p className="text-xs font-semibold uppercase text-subtle">
                    Suggested demo action
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ink">{card.suggestedAction}</p>
                </div>
              </div>
              <Link
                className="mt-8 inline-flex h-10 w-fit items-center justify-center rounded-md bg-pine px-4 text-sm font-semibold text-white transition hover:bg-pine-dark focus:outline-none focus:ring-2 focus:ring-lichen focus:ring-offset-2 focus:ring-offset-panel active:translate-y-px"
                href={card.href}
              >
                Open route
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
