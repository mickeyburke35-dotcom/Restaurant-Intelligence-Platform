import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Restaurant Intelligence Platform | Review Intelligence for Agencies",
  description:
    "A tenant-scoped review intelligence platform for agencies, consultants, and restaurant groups managing multiple clients."
};

const problemPoints = [
  {
    title: "Review evidence is scattered",
    text: "Teams switch between sources, exports, client folders, and notes before they can explain what changed."
  },
  {
    title: "Client reporting is hard to repeat",
    text: "Each client needs the same careful story: what happened, what supports it, and what needs review."
  },
  {
    title: "AI output needs guardrails",
    text: "Summaries must stay tied to approved data, confidence context, and human approval for high-impact advice."
  }
];

const workflow = [
  {
    title: "Import approved reviews",
    text: "Connect permitted sources, partner exports, CSV files, or demo data with clear source status."
  },
  {
    title: "Scope by agency",
    text: "Keep each client, location, review, report, and insight filtered by agency context."
  },
  {
    title: "Classify themes",
    text: "Identify sentiment, repeated topics, source coverage gaps, and changes that need analyst attention."
  },
  {
    title: "Review AI drafts",
    text: "Store model, timestamp, confidence, status, and evidence links before client-facing use."
  },
  {
    title: "Export reports",
    text: "Create client-ready PDF and CSV outputs with the evidence appendix close at hand."
  }
];

const aiControls = [
  "Source review links for every generated insight",
  "Confidence and sample context when evidence is limited",
  "Separate AI records with model and timestamp metadata",
  "Human review before high-impact recommendations",
  "Plain insufficient-data states instead of filled-in gaps"
];

const targetUsers = [
  {
    title: "Agency owners and admins",
    text: "Manage workspaces, client access, billing readiness, users, roles, and source settings."
  },
  {
    title: "Account managers",
    text: "Turn portfolio signals into client conversations, priorities, and recurring report packages."
  },
  {
    title: "Analysts and consultants",
    text: "Filter reviews, inspect evidence, approve insight drafts, and prepare recommendations for review."
  },
  {
    title: "Client viewers",
    text: "Read dashboard and report views with controlled access to their permitted restaurant data."
  }
];

const footerLinks = ["Workflow", "AI controls", "Users"];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#F6F3EE] text-[#26343B]">
      <header className="border-b border-[#DCD4CA]/80 bg-[#F6F3EE]/95">
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#top" className="text-sm font-semibold text-[#26343B]">
            Restaurant Intelligence Platform
          </a>
          <div className="hidden items-center gap-7 text-sm font-medium text-[#647178] md:flex">
            <a className="transition hover:text-[#26343B]" href="#workflow">
              Workflow
            </a>
            <a className="transition hover:text-[#26343B]" href="#ai-trust">
              AI controls
            </a>
            <a className="transition hover:text-[#26343B]" href="#users">
              Users
            </a>
          </div>
          <a
            className="rounded-md bg-[#3F5E4D] px-4 py-2 text-sm font-semibold text-[#FBFAF7] transition hover:bg-[#334D40] focus:outline-none focus:ring-2 focus:ring-[#D9EA75] focus:ring-offset-2 focus:ring-offset-[#F6F3EE] active:translate-y-px"
            href="#workflow"
          >
            <span className="sm:hidden">Workflow</span>
            <span className="hidden sm:inline">Review workflow</span>
          </a>
        </nav>
      </header>

      <section
        id="top"
        className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:py-18"
      >
        <div>
          <p className="text-sm font-semibold text-[#3F5E4D]">
            Tenant-scoped review intelligence
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-[#26343B] sm:text-5xl">
            Restaurant review intelligence for agencies
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#647178]">
            Turn approved public review data into evidence-linked dashboards, insights, and reports for multi-client teams.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex h-11 items-center justify-center rounded-md bg-[#3F5E4D] px-5 text-sm font-semibold text-[#FBFAF7] transition hover:bg-[#334D40] focus:outline-none focus:ring-2 focus:ring-[#D9EA75] focus:ring-offset-2 focus:ring-offset-[#F6F3EE] active:translate-y-px"
              href="#workflow"
            >
              Review workflow
            </a>
            <a
              className="inline-flex h-11 items-center justify-center rounded-md border border-[#BFC8BE] bg-[#FBFAF7] px-5 text-sm font-semibold text-[#26343B] transition hover:border-[#3F5E4D] focus:outline-none focus:ring-2 focus:ring-[#D9EA75] focus:ring-offset-2 focus:ring-offset-[#F6F3EE] active:translate-y-px"
              href="#ai-trust"
            >
              Check AI controls
            </a>
          </div>
        </div>

        <div
          className="rounded-md border border-[#DCD4CA] bg-[#FBFAF7] p-4 shadow-[0_24px_60px_rgba(63,94,77,0.10)] sm:p-5"
          role="img"
          aria-label="Operational workflow from approved review sources to tenant-scoped insights and client reports"
        >
          <div className="rounded-md border border-[#DCD4CA] bg-[#FDFCF9] p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-[#DCD4CA] bg-[#F6F3EE] p-4">
                <p className="text-xs font-semibold text-[#647178]">Approved source</p>
                <p className="mt-3 text-lg font-semibold text-[#26343B]">Public reviews</p>
                <p className="mt-2 text-sm leading-6 text-[#647178]">
                  Source status, date range, location, and evidence URL stay attached.
                </p>
              </div>
              <div className="rounded-md border border-[#DCD4CA] bg-[#F6F3EE] p-4">
                <p className="text-xs font-semibold text-[#647178]">Tenant scope</p>
                <p className="mt-3 text-lg font-semibold text-[#26343B]">Agency filter</p>
                <p className="mt-2 text-sm leading-6 text-[#647178]">
                  Agency, client, location, role, and report context travel together.
                </p>
              </div>
            </div>

            <div className="my-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="h-px bg-[#DCD4CA]" />
              <div className="rounded-md bg-[#D9EA75] px-3 py-1 text-xs font-semibold text-[#26343B]">
                Evidence path
              </div>
              <div className="h-px bg-[#DCD4CA]" />
            </div>

            <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-md border border-[#DCD4CA] bg-[#F6F3EE] p-4">
                <p className="text-xs font-semibold text-[#647178]">Insight draft</p>
                <h2 className="mt-3 text-xl font-semibold text-[#26343B]">
                  Source-linked summary
                </h2>
                <div className="mt-4 grid gap-2 text-sm text-[#647178]">
                  <div className="flex items-center justify-between rounded-md bg-[#FBFAF7] px-3 py-2">
                    <span>Confidence context</span>
                    <span className="font-semibold text-[#3F5E4D]">Required</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-[#FBFAF7] px-3 py-2">
                    <span>Source review IDs</span>
                    <span className="font-semibold text-[#3F5E4D]">Attached</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-[#FBFAF7] px-3 py-2">
                    <span>Human review</span>
                    <span className="font-semibold text-[#B9842E]">Needed</span>
                  </div>
                </div>
              </div>
              <div className="rounded-md border border-[#3F5E4D]/30 bg-[#E7EEE7] p-4">
                <p className="text-xs font-semibold text-[#3F5E4D]">Client output</p>
                <p className="mt-3 text-lg font-semibold text-[#26343B]">Dashboard and report</p>
                <p className="mt-2 text-sm leading-6 text-[#647178]">
                  KPIs, charts, approved insights, exports, and evidence appendix stay aligned.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#DCD4CA] bg-[#FBFAF7] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold text-[#26343B] sm:text-4xl">
              Multi-client review work needs a clearer operating model.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#647178]">
              Agencies and consultants need repeatable analysis without losing source context, tenant boundaries, or review judgment.
            </p>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-[1.1fr_0.9fr_1fr]">
            {problemPoints.map((point) => (
              <article
                className="rounded-md border border-[#DCD4CA] bg-[#FDFCF9] p-6"
                key={point.title}
              >
                <h3 className="text-lg font-semibold text-[#26343B]">{point.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#647178]">{point.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold text-[#26343B] sm:text-4xl">
              From approved source to report.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#647178]">
              The platform is designed around a traceable workflow for data intake, analysis, approval, and export.
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-5">
            {workflow.map((item) => (
              <article
                className="rounded-md border border-[#DCD4CA] bg-[#FBFAF7] p-5"
                key={item.title}
              >
                <h3 className="text-base font-semibold text-[#26343B]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#647178]">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="ai-trust" className="border-y border-[#DCD4CA] bg-[#E7EEE7] px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-3xl font-semibold text-[#26343B] sm:text-4xl">
              AI stays accountable to evidence.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#52635A]">
              Summaries are draft assistance. The system records what data was used, where it came from, and when human review is required.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {aiControls.map((control) => (
              <div
                className="rounded-md border border-[#BFC8BE] bg-[#FBFAF7] p-5 text-sm font-medium leading-7 text-[#26343B]"
                key={control}
              >
                {control}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="users" className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold text-[#26343B] sm:text-4xl">
              Built for the people who manage client review programs.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#647178]">
              Each role gets a focused view of the same agency-scoped data, from setup to client reporting.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {targetUsers.map((user) => (
              <article
                className="rounded-md border border-[#DCD4CA] bg-[#FBFAF7] p-6"
                key={user.title}
              >
                <h3 className="text-lg font-semibold text-[#26343B]">{user.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#647178]">{user.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8">
        <div className="mx-auto max-w-7xl rounded-md border border-[#3F5E4D]/30 bg-[#3F5E4D] p-8 text-[#FBFAF7] sm:p-10 lg:flex lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Start with the approved-review workflow.
            </h2>
            <p className="mt-4 text-base leading-8 text-[#E5EEE7]">
              Map sources, tenant scope, AI review controls, and report outputs before adding live integrations.
            </p>
          </div>
          <a
            className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-[#D9EA75] px-5 text-sm font-semibold text-[#26343B] transition hover:bg-[#CDE05F] focus:outline-none focus:ring-2 focus:ring-[#FBFAF7] focus:ring-offset-2 focus:ring-offset-[#3F5E4D] active:translate-y-px lg:mt-0"
            href="#workflow"
          >
            Review workflow
          </a>
        </div>
      </section>

      <footer className="border-t border-[#DCD4CA] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-[#647178] md:flex-row md:items-center md:justify-between">
          <p className="font-medium text-[#26343B]">Restaurant Intelligence Platform</p>
          <div className="flex flex-wrap gap-5">
            {footerLinks.map((link) => (
              <a
                className="transition hover:text-[#26343B]"
                href={link === "Workflow" ? "#workflow" : link === "AI controls" ? "#ai-trust" : "#users"}
                key={link}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
