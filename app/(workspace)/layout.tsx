import type { ReactNode } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireActiveAuthContext } from "@/lib/auth/context";

export default async function WorkspaceLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const context = await requireActiveAuthContext("/workspace");

  return (
    <main className="min-h-screen bg-[#F6F3EE] text-[#26343B]">
      <div className="grid min-h-screen lg:grid-cols-[240px_1fr]">
        <aside className="border-b border-[#DCD4CA] bg-[#26343B] px-5 py-5 text-[#FBFAF7] lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-4 lg:block">
            <div>
              <p className="text-sm font-semibold">Restaurant Intelligence</p>
              <p className="mt-1 text-xs text-[#C8D1CF]">Agency context</p>
            </div>
            <div className="rounded-md border border-[#5D6D72] px-3 py-2 text-xs font-medium lg:mt-8">
              Workspace
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="flex min-h-16 flex-col gap-4 border-b border-[#DCD4CA] bg-[#FBFAF7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
            <div>
              <p className="text-xs font-semibold uppercase text-[#647178]">Active agency</p>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <p className="text-base font-semibold text-[#26343B]">{context.agency.name}</p>
                <span className="rounded-md bg-[#E7EEE7] px-2.5 py-1 text-xs font-semibold text-[#3F5E4D]">
                  {context.membership.role}
                </span>
              </div>
            </div>
            <SignOutButton />
          </header>

          <div className="px-5 py-6 lg:px-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
