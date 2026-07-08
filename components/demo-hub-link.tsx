import Link from "next/link";

export function DemoHubLink() {
  return (
    <Link
      className="inline-flex h-9 w-fit items-center justify-center rounded-md border border-line bg-panel px-3 text-xs font-semibold text-muted transition hover:border-pine hover:text-pine focus:outline-none focus:ring-2 focus:ring-lichen focus:ring-offset-2 focus:ring-offset-canvas active:translate-y-px"
      href="/demo"
    >
      ← Demo Hub
    </Link>
  );
}
