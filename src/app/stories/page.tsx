import Link from "next/link";
import { TestimonyCard } from "@/components/testimony-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getDiscoverTestimonies } from "@/lib/testimonies";
import { prisma } from "@/lib/db";
import { monthOptions2026 } from "@/lib/timezone";

export const metadata = {
  title: "Stories",
  description: "Browse testimonies from 2026 by category, month, and place.",
};

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    category?: string;
    location?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const month = typeof params.month === "string" ? params.month : undefined;
  const categoryId =
    typeof params.category === "string" ? params.category : undefined;
  const location =
    typeof params.location === "string" ? params.location : undefined;
  const page = Number(params.page || 1) || 1;

  const [result, categories] = await Promise.all([
    getDiscoverTestimonies({ month, categoryId, location, page }),
    prisma.category.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(result.total / result.take));

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-wide text-ink/50">Discover</p>
        <h1 className="mt-3 font-serif text-4xl text-ink md:text-5xl">
          Stories from 2026
        </h1>
        <p className="mt-4 text-lg text-ink/70">
          Browse by category, month, or place. Every story is free to read.
        </p>
      </div>

      <form
        method="get"
        className="mt-10 grid gap-4 rounded-2xl border border-ink/10 bg-white/70 p-6 md:grid-cols-4"
      >
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
        <Input name="location" placeholder="Location" defaultValue={location} />
        <Button type="submit">Browse</Button>
      </form>

      <p className="mt-8 text-sm text-ink/50">
        {result.total.toLocaleString()} testimon
        {result.total === 1 ? "y" : "ies"}
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {result.items.map((testimony) => (
          <TestimonyCard key={testimony.id} testimony={testimony} />
        ))}
      </div>

      {result.items.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-ink/10 p-10 text-center text-ink/60">
          No testimonies match these filters yet.
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-3">
          {page > 1 && (
            <Button asChild variant="secondary">
              <Link
                href={`/stories?month=${month || ""}&category=${categoryId || ""}&location=${location || ""}&page=${page - 1}`}
              >
                Previous
              </Link>
            </Button>
          )}
          {page < totalPages && (
            <Button asChild variant="secondary">
              <Link
                href={`/stories?month=${month || ""}&category=${categoryId || ""}&location=${location || ""}&page=${page + 1}`}
              >
                Next
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
