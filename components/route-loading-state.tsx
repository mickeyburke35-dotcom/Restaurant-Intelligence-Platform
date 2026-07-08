type RouteLoadingStateProps = {
  eyebrow: string;
  title: string;
  detail: string;
  metricCount?: 2 | 3 | 4;
  sidebar?: boolean;
};

function SkeletonLine({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-line/70 ${className}`} />;
}

function SkeletonMetric() {
  return (
    <div className="rounded-md border border-line bg-white px-4 py-3">
      <SkeletonLine className="h-3 w-16" />
      <SkeletonLine className="mt-3 h-6 w-12" />
    </div>
  );
}

function metricGridClassName(metricCount: 2 | 3 | 4): string {
  const classes = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-4"
  };

  return classes[metricCount];
}

export function RouteLoadingState({
  detail,
  eyebrow,
  metricCount = 3,
  sidebar = true,
  title
}: RouteLoadingStateProps) {
  return (
    <main aria-busy="true" className="min-h-screen bg-canvas text-ink">
      <section className="border-b border-line bg-[#f4f5ed]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <SkeletonLine className="h-9 w-28" />
          <p className="mt-5 text-sm font-semibold uppercase text-pine">{eyebrow}</p>
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted">{detail}</p>
            </div>
            <div className={`grid gap-2 text-sm ${metricGridClassName(metricCount)}`}>
              {Array.from({ length: metricCount }).map((_, index) => (
                <SkeletonMetric key={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div
        className={`mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-8 ${
          sidebar ? "xl:grid-cols-[360px_minmax(0,1fr)]" : ""
        }`}
      >
        {sidebar ? (
          <aside className="grid content-start gap-5">
            <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
              <SkeletonLine className="h-5 w-32" />
              <SkeletonLine className="mt-4 h-11 w-full" />
              <SkeletonLine className="mt-3 h-11 w-full" />
              <SkeletonLine className="mt-5 h-10 w-full" />
            </div>
            <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
              <SkeletonLine className="h-5 w-28" />
              <div className="mt-4 grid gap-3">
                <SkeletonLine className="h-16 w-full" />
                <SkeletonLine className="h-16 w-full" />
                <SkeletonLine className="h-16 w-full" />
              </div>
            </div>
          </aside>
        ) : null}

        <section className="min-w-0 rounded-lg border border-line bg-white p-5 shadow-soft">
          <SkeletonLine className="h-6 w-40" />
          <div className="mt-6 grid gap-4">
            <SkeletonLine className="h-20 w-full" />
            <SkeletonLine className="h-20 w-full" />
            <SkeletonLine className="h-20 w-full" />
            <SkeletonLine className="h-20 w-4/5" />
          </div>
        </section>
      </div>
    </main>
  );
}
