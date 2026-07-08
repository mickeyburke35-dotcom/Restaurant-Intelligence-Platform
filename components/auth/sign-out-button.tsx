"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST"
      });
      const body = (await response.json()) as { error?: string; redirectTo?: string };

      if (!response.ok) {
        setError(body.error ?? "We could not sign you out.");
        return;
      }

      router.replace(body.redirectTo ?? "/sign-in");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-3">
      {error ? <span className="text-xs text-[#B84A4A]">{error}</span> : null}
      <button
        className="h-9 rounded-md border border-[#DCD4CA] bg-[#FBFAF7] px-3 text-sm font-semibold text-[#26343B] transition hover:border-[#3F5E4D] focus:outline-none focus:ring-2 focus:ring-[#D9EA75] focus:ring-offset-2 focus:ring-offset-[#F6F3EE] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        onClick={handleSignOut}
        type="button"
      >
        {isPending ? "Signing out" : "Sign out"}
      </button>
    </div>
  );
}
