import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/8 bg-paper py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-serif text-lg text-ink">My Year of Grace</p>
          <p className="mt-1 text-sm text-ink/60">
            A digital time capsule of gratitude for 2026.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-ink/60">
          <Link href="/stories" className="hover:text-ink">
            Stories
          </Link>
          <Link href="/archive" className="hover:text-ink">
            Archive
          </Link>
          <Link href="/about" className="hover:text-ink">
            About
          </Link>
          <Link href="/privacy" className="hover:text-ink">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-ink">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
