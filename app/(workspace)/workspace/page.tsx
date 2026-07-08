import type { Metadata } from "next";
import Link from "next/link";
import { requireActiveAuthContext } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "Workspace | Restaurant Intelligence Platform",
  description: "Authenticated workspace context."
};

export default async function WorkspacePage() {
  const context = await requireActiveAuthContext("/workspace");

  return (
    <section className="max-w-4xl">
      <div className="rounded-md border border-[#DCD4CA] bg-[#FBFAF7] p-6">
        <p className="text-sm font-semibold text-[#3F5E4D]">Signed in</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#26343B]">
          {context.agency.name}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#647178]">
          Your active agency and membership role are resolved for protected routes.
        </p>
        <Link
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-[#3F5E4D] px-4 text-sm font-semibold text-[#FBFAF7] transition hover:bg-[#31493D] focus:outline-none focus:ring-2 focus:ring-[#D9EA75] focus:ring-offset-2 focus:ring-offset-[#FBFAF7] active:translate-y-px"
          href="/demo"
        >
          Continue to Demo Hub
        </Link>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-[#DCD4CA] bg-[#FDFCF9] p-4">
            <dt className="text-xs font-semibold uppercase text-[#647178]">User</dt>
            <dd className="mt-2 text-sm font-semibold text-[#26343B]">{context.user.email}</dd>
          </div>
          <div className="rounded-md border border-[#DCD4CA] bg-[#FDFCF9] p-4">
            <dt className="text-xs font-semibold uppercase text-[#647178]">Role</dt>
            <dd className="mt-2 text-sm font-semibold text-[#26343B]">{context.membership.role}</dd>
          </div>
          <div className="rounded-md border border-[#DCD4CA] bg-[#FDFCF9] p-4">
            <dt className="text-xs font-semibold uppercase text-[#647178]">Agency slug</dt>
            <dd className="mt-2 text-sm font-semibold text-[#26343B]">{context.agency.slug}</dd>
          </div>
          <div className="rounded-md border border-[#DCD4CA] bg-[#FDFCF9] p-4">
            <dt className="text-xs font-semibold uppercase text-[#647178]">Client scope</dt>
            <dd className="mt-2 text-sm font-semibold text-[#26343B]">
              {context.membership.restaurantId ?? "Agency-wide"}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
