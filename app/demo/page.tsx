import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Demo Hub | Restaurant Intelligence Platform",
  description:
    "A single landing page for live Restaurant Intelligence Platform demonstrations."
};

const demoCards = [
  {
    title: "Restaurants",
    description: "Open restaurant client management and agency-scoped setup workflows.",
    href: "/restaurants"
  },
  {
    title: "Locations",
    description: "Manage restaurant locations from the existing restaurant records workflow.",
    href: "/restaurants"
  },
  {
    title: "Reviews",
    description: "Review approved public feedback with filters, sorting, and detail views.",
    href: "/reviews"
  },
  {
    title: "AI Insights",
    description: "Inspect evidence-linked AI insight drafts and human review controls.",
    href: "/insights"
  },
  {
    title: "Reports",
    description: "Create and review tenant-scoped report snapshots from approved insights.",
    href: "/reports"
  },
  {
    title: "Authentication",
    description: "Open the existing sign-in flow for agency workspace access.",
    href: "/sign-in"
  }
] as const;

export default function DemoHubPage() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-10 sm:px-8 lg:py-14">
        <header className="border-b border-line pb-8">
          <p className="text-sm font-semibold text-pine">Live demonstrations</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-ink sm:text-5xl">
            Restaurant Intelligence Platform
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            AI-powered restaurant review intelligence for hospitality agencies.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {demoCards.map((card) => (
            <article
              className="flex min-h-56 flex-col justify-between rounded-md border border-line bg-panel p-6 shadow-soft"
              key={card.title}
            >
              <div>
                <h2 className="text-xl font-semibold text-ink">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">{card.description}</p>
              </div>
              <Link
                className="mt-8 inline-flex h-10 w-fit items-center justify-center rounded-md bg-pine px-4 text-sm font-semibold text-white transition hover:bg-pine-dark focus:outline-none focus:ring-2 focus:ring-lichen focus:ring-offset-2 focus:ring-offset-panel active:translate-y-px"
                href={card.href}
              >
                Open
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
