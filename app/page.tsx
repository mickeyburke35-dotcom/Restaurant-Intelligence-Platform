export default function Home() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16 sm:px-10">
        <p className="text-sm font-medium uppercase text-pine">Presentation demo</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold sm:text-5xl">
          Restaurant Intelligence Platform
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
          Start the live MVP walkthrough from the Demo Hub.
        </p>
        <a
          className="mt-8 inline-flex w-fit rounded-md bg-pine px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#184f45] focus:outline-none focus:ring-2 focus:ring-[#d9ea75] focus:ring-offset-2"
          href="/demo"
        >
          Open Demo Hub
        </a>
      </section>
    </main>
  );
}
