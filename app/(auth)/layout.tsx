import type { ReactNode } from "react";

export default function AuthLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-[#F6F3EE] text-[#26343B]">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden lg:block">
          <p className="text-sm font-semibold text-[#3F5E4D]">Restaurant Intelligence Platform</p>
          <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight">
            Agency-scoped access for review intelligence teams.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-8 text-[#647178]">
            Sign in with an active agency membership to resolve workspace, role, and client scope before product data loads.
          </p>
        </section>
        {children}
      </div>
    </main>
  );
}
