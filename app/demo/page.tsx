import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Demo Hub | Restaurant Intelligence Platform",
  description:
    "A single landing page for live Restaurant Intelligence Platform demonstrations."
};

const demoCards = [
  {
    cta: "Open workspace",
    description: "Confirm the active agency, role, and authenticated workspace context.",
    href: "/workspace",
    stage: "Access",
    title: "Workspace context"
  },
  {
    cta: "Manage clients",
    description: "Open restaurant management, then use a row action to manage locations.",
    href: "/restaurants",
    stage: "Setup",
    title: "Restaurants and locations"
  },
  {
    cta: "Open dashboard",
    title: "Reviews",
    description: "Filter approved public feedback, sort the table, and inspect review detail.",
    href: "/reviews"
  },
  {
    cta: "Review drafts",
    title: "AI Insights",
    description: "Check draft summaries, supporting evidence, and human approval status.",
    href: "/insights"
  },
  {
    cta: "View reports",
    title: "Reports",
    description: "Create and read tenant-scoped snapshots from approved insights only.",
    href: "/reports"
  },
  {
    cta: "Open sign-in",
    title: "Authentication",
    description: "Use the existing sign-in flow when recording unauthenticated access.",
    href: "/sign-in"
  }
] as const;

const demoFlow = [
  "Confirm workspace context",
  "Manage restaurants and locations",
  "Review imported feedback",
  "Approve AI insights",
  "Open report snapshots"
] as const;

export default function DemoHubPage() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:py-12">
        <header className="grid gap-6 border-b border-line pb-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-pine">Live demonstrations</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-ink sm:text-5xl">
              Restaurant Intelligence Platform
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              Walk through agency context, approved review data, human-reviewed insights, and
              report snapshots.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-panel p-4 shadow-soft">
            <h2 className="text-sm font-semibold text-ink">Recommended flow</h2>
            <ol className="mt-3 grid gap-2 text-sm text-muted">
              {demoFlow.map((step, index) => (
                <li
                  className="grid grid-cols-[2rem_1fr] items-center gap-2 rounded-md border border-line bg-snow px-3 py-2"
                  key={step}
                >
                  <span className="font-semibold text-pine">{String(index + 1).padStart(2, "0")}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {demoCards.map((card) => (
            <article
              className="flex min-h-56 flex-col justify-between rounded-lg border border-line bg-panel p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-pine/50"
              key={card.title}
            >
              <div>
                <p className="text-xs font-semibold uppercase text-pine">
                  {"stage" in card ? card.stage : "Product route"}
                </p>
                <h2 className="mt-3 text-xl font-semibold text-ink">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">{card.description}</p>
              </div>
              <Link
                className="mt-8 inline-flex h-10 w-full items-center justify-center rounded-md bg-pine px-4 text-sm font-semibold text-white transition hover:bg-pine-dark focus:outline-none focus:ring-2 focus:ring-lichen focus:ring-offset-2 focus:ring-offset-panel active:translate-y-px sm:w-fit"
                href={card.href}
              >
                {card.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
