export default function Home() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16 sm:px-10">
        <p className="text-sm font-medium uppercase text-pine">Workspace foundation</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold sm:text-5xl">
          Restaurant Intelligence Platform
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
          Initial application shell for tenant-scoped product work.
        </p>
        <a
          className="mt-8 inline-flex h-10 w-fit items-center justify-center rounded-md bg-pine px-4 text-sm font-semibold text-white transition hover:bg-[#174E44] focus:outline-none focus:ring-2 focus:ring-[#D9EA75] focus:ring-offset-2 focus:ring-offset-canvas active:translate-y-px"
          href="/sign-in"
        >
          Sign in
        </a>
      </section>
    </main>
  );
}
