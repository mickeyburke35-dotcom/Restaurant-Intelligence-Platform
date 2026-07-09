"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

type SignInFormProps = {
  nextPath: string;
};

export function SignInForm({ nextPath }: SignInFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.get("email"),
          agencySlug: formData.get("agencySlug"),
          next: nextPath
        })
      });
      const body = (await response.json()) as { error?: string; redirectTo?: string };

      if (!response.ok) {
        setError(body.error ?? "We could not sign you in.");
        return;
      }

      router.replace(body.redirectTo ?? "/workspace");
      router.refresh();
    });
  }

  return (
    <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-[#26343B]" htmlFor="email">
          Email
        </label>
        <input
          autoComplete="email"
          className="h-10 rounded-md border border-[#DCD4CA] bg-[#FDFCF9] px-3 text-sm text-[#26343B] outline-none transition focus:border-[#3F5E4D] focus:ring-2 focus:ring-[#D9EA75]"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-[#26343B]" htmlFor="agencySlug">
          Agency slug
        </label>
        <input
          autoComplete="organization"
          className="h-10 rounded-md border border-[#DCD4CA] bg-[#FDFCF9] px-3 text-sm text-[#26343B] outline-none transition focus:border-[#3F5E4D] focus:ring-2 focus:ring-[#D9EA75]"
          id="agencySlug"
          name="agencySlug"
          type="text"
        />
        <p className="text-xs leading-5 text-[#647178]">Leave blank if your account has one active agency.</p>
      </div>

      {error ? (
        <p className="rounded-md border border-[#B84A4A]/30 bg-[#F6EAEA] px-3 py-2 text-sm text-[#8A3434]">
          {error}
        </p>
      ) : null}

      <button
        className="h-10 rounded-md bg-[#3F5E4D] px-4 text-sm font-semibold text-[#FBFAF7] transition hover:bg-[#334D40] focus:outline-none focus:ring-2 focus:ring-[#D9EA75] focus:ring-offset-2 focus:ring-offset-[#FBFAF7] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
