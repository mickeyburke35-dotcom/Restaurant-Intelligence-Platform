import type { Metadata } from "next";
import { LeadCaptureForm } from "./lead-capture-form";

export const metadata: Metadata = {
  title: "Lead Capture Demo | Restaurant Intelligence Platform",
  description:
    "A standalone demo page for collecting restaurant intelligence demo requests."
};

export default function LeadCaptureDemoPage() {
  return (
    <main className="min-h-[100dvh] bg-canvas text-ink">
      <section className="mx-auto grid min-h-[100dvh] w-full max-w-6xl items-center gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-pine">
            Lead capture demo
          </p>
          <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Turn review signals into clearer restaurant decisions.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
            Capture interest from restaurant teams that want clearer reporting on
            reviews, sentiment, and local market signals.
          </p>

          <div className="mt-8 max-w-lg">
            <LeadCaptureForm />
          </div>
        </div>

        <div className="relative min-h-[360px] overflow-hidden rounded-2xl border border-ink/10 bg-steel shadow-[0_28px_90px_rgba(22,32,31,0.16)] sm:min-h-[460px]">
          <div
            aria-label="Restaurant dining room with warm service activity"
            className="absolute inset-0 bg-cover bg-center"
            role="img"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(22, 32, 31, 0.08), rgba(22, 32, 31, 0.48)), url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80')"
            }}
          />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <div className="rounded-xl bg-white/[0.92] p-4 shadow-[0_18px_50px_rgba(22,32,31,0.16)]">
              <p className="text-sm font-semibold text-ink">
                Built for agency-led restaurant growth teams.
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Keep demo interest separate from product data while routing every
                request to the same trusted database workflow.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
