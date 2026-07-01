"use client";

import { FormEvent, useId, useState } from "react";
import {
  demoLeadRequestSchema,
  type DemoLeadResponse
} from "@/lib/demo-leads";

type FormState = "idle" | "submitting" | "success" | "error";

export function LeadCaptureForm() {
  const emailId = useId();
  const helperId = useId();
  const errorId = useId();
  const statusId = useId();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");

  const isSubmitting = formState === "submitting";
  const describedBy = [helperId, emailError ? errorId : null, message ? statusId : null]
    .filter(Boolean)
    .join(" ");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailError(null);
    setMessage("");

    const parsed = demoLeadRequestSchema.safeParse({ email });

    if (!parsed.success) {
      setEmailError(
        parsed.error.flatten().fieldErrors.email?.[0] ??
          "Enter a valid email address."
      );
      setFormState("idle");
      return;
    }

    setFormState("submitting");

    try {
      const response = await fetch("/api/demo/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: parsed.data.email })
      });

      let body: DemoLeadResponse | null = null;

      try {
        body = (await response.json()) as DemoLeadResponse;
      } catch {
        body = null;
      }

      if (!response.ok || !body?.ok) {
        const fallbackMessage =
          "We could not save your request right now. Please try again soon.";

        setEmailError(body?.ok === false ? body.fieldErrors?.email?.[0] ?? null : null);
        setMessage(body?.ok === false ? body.message : fallbackMessage);
        setFormState("error");
        return;
      }

      setEmail("");
      setMessage(body.message);
      setFormState("success");
    } catch {
      setMessage("We could not save your request right now. Please try again soon.");
      setFormState("error");
    }
  }

  return (
    <form
      className="rounded-2xl border border-ink/10 bg-white/90 p-4 shadow-[0_24px_80px_rgba(22,32,31,0.10)] sm:p-5"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="grid gap-2">
        <label className="text-sm font-medium text-ink" htmlFor={emailId}>
          Work email
        </label>
        <input
          aria-describedby={describedBy}
          aria-invalid={emailError ? "true" : "false"}
          autoComplete="email"
          className="min-h-12 w-full rounded-xl border border-ink/20 bg-white px-4 text-base text-ink outline-none transition focus:border-pine focus:ring-4 focus:ring-pine/15 disabled:cursor-not-allowed disabled:bg-ink/5"
          disabled={isSubmitting}
          id={emailId}
          inputMode="email"
          name="email"
          onChange={(event) => {
            setEmail(event.target.value);
            if (emailError) {
              setEmailError(null);
            }
          }}
          placeholder="name@company.com"
          type="email"
          value={email}
        />
        <p className="text-sm leading-6 text-muted" id={helperId}>
          We will use this only to coordinate your demo request.
        </p>
        {emailError ? (
          <p className="text-sm font-medium text-red-700" id={errorId}>
            {emailError}
          </p>
        ) : null}
      </div>

      <button
        className="mt-4 min-h-12 w-full rounded-xl bg-pine px-5 text-sm font-semibold text-white transition hover:bg-[#18554a] active:translate-y-px disabled:cursor-not-allowed disabled:bg-muted"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Scheduling..." : "Schedule Demo"}
      </button>

      {message ? (
        <p
          className={
            formState === "success"
              ? "mt-4 rounded-xl bg-pine/10 px-4 py-3 text-sm font-medium text-pine"
              : "mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          }
          id={statusId}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
