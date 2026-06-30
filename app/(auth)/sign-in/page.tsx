import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/sign-in-form";
import { getSafeRedirectPath } from "@/lib/auth/request";

export const metadata: Metadata = {
  title: "Sign In | Restaurant Intelligence Platform",
  description: "Sign in to the Restaurant Intelligence Platform."
};

type SignInPageProps = {
  searchParams: Promise<{
    next?: string | string[];
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const next = Array.isArray(params.next) ? params.next[0] : params.next;
  const nextPath = getSafeRedirectPath(next);

  return (
    <section className="rounded-md border border-[#DCD4CA] bg-[#FBFAF7] p-6 shadow-[0_18px_50px_rgba(63,94,77,0.08)] sm:p-8">
      <div className="max-w-md">
        <p className="text-sm font-semibold text-[#3F5E4D]">Secure workspace access</p>
        <h2 className="mt-3 text-3xl font-semibold text-[#26343B]">Sign in</h2>
        <p className="mt-3 text-sm leading-6 text-[#647178]">
          Use the email tied to your active agency membership.
        </p>
        <SignInForm nextPath={nextPath} />
      </div>
    </section>
  );
}
