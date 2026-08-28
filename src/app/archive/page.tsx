import Link from "next/link";
import { TestimonyCard } from "@/components/testimony-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getArchiveStats } from "@/lib/stats";
import { getLockedArchiveEntries } from "@/lib/testimonies";
import { prisma } from "@/lib/db";
import { monthOptions2026 } from "@/lib/timezone";

export const metadata = {
  title: "The 2026 Grace Archive",
  description:
    "These are the testimonies people chose to preserve forever in the 2026 Grace Archive.",
};

export default async function ArchivePage({
  searchParams,
}: PageProps<"/archive">) {
  const params = await searchParams;
  const month = typeof params.month === "string" ? params.month : undefined;
  const categoryId =
    typeof params.category === "string" ? params.category : undefined;
  const location =
    typeof params.location === "string" ? params.location : undefined;
  const search = typeof params.q === "string" ? params.q : undefined;

  const [entries, categories, stats] = await Promise.all([
    getLockedArchiveEntries({ month, categoryId, location, search }),
    prisma.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    getArchiveStats(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-wide text-ember">🔒 The 2026 Grace Archive</p>
        <h1 className="mt-3 font-serif text-4xl text-ink md:text-5xl">
          10,000 permanent places.
        </h1>
        <p className="mt-4 text-lg text-ink/70">
          These are the testimonies people chose to preserve forever.
        </p>
        <p className="mt-4 text-sm text-ink/60">
          {stats.claimed.toLocaleString()} / {stats.capacity.toLocaleString()} Grace places claimed
        </p>
      </div>

      <form method="get" className="mt-10 grid gap-4 rounded-2xl border border-ink/10 bg-white/70 p-6 md:grid-cols-4">
        <Input name="q" placeholder="Search the Grace Archive" defaultValue={search} />
        <select
          name="month"
          defaultValue={month}
          className="h-11 rounded-xl border border-ink/10 bg-white px-4 text-sm"
        >
          <option value="">All months</option>
          {monthOptions2026().map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          name="category"
          defaultValue={categoryId}
          className="h-11 rounded-xl border border-ink/10 bg-white px-4 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.emoji} {category.name}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <Input name="location" placeholder="Location" defaultValue={location} />
          <Button type="submit">Filter</Button>
        </div>
      </form>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <TestimonyCard
            key={entry.id}
            testimony={{
              ...entry.testimony,
              lockedArchive: {
                archiveNumber: entry.archiveNumber,
                customSlug: entry.customSlug,
              },
            }}
          />
        ))}
      </div>

      {entries.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-ink/10 p-10 text-center text-ink/60">
          No locked testimonies match your filters yet.
        </div>
      )}

      <div className="mt-12 text-center">
        <Button asChild>
          <Link href="/share">Share Your Testimony</Link>
        </Button>
      </div>
    </div>
  );
}
