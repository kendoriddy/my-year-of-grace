import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/8 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-serif text-lg tracking-wide text-ink">
          My Year of Grace
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-ink/70 md:flex">
          <Link href="/#calendar" className="hover:text-ink">
            Explore 2026
          </Link>
          <Link href="/archive" className="hover:text-ink">
            Archive
          </Link>
        </nav>
        <Button asChild size="sm">
          <Link href="/share">Tell My Testimony</Link>
        </Button>
      </div>
    </header>
  );
}
