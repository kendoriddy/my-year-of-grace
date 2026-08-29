import Link from "next/link";
import { notFound } from "next/navigation";
import { TestimonyCard } from "@/components/testimony-card";
import { Button } from "@/components/ui/button";
import { getTestimoniesForDayPaged } from "@/lib/testimonies";
import { formatLagosDate, parseDateParam } from "@/lib/timezone";

export async function generateMetadata({ params }: PageProps<"/day/[date]">) {
  const { date } = await params;
  const parsed = parseDateParam(date);
  if (!parsed) return { title: "Day not found" };
  return {
    title: `Testimonies for ${formatLagosDate(parsed)}`,
    description: `Read testimonies shared for ${formatLagosDate(parsed)} on My Year of Grace.`,
  };
}

export default async function DayPage({
  params,
  searchParams,
}: PageProps<"/day/[date]">) {
  const { date } = await params;
  const query = await searchParams;
  const parsed = parseDateParam(date);
  if (!parsed) notFound();

  const page = Number(query.page || 1) || 1;
  const { items, total, take } = await getTestimoniesForDayPaged(date, page);
  const preserved = items.filter((item) => item.lockedArchive).length;
  const totalPages = Math.max(1, Math.ceil(total / take));

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-ink/50">Day in 2026</p>
          <h1 className="font-serif text-4xl text-ink">{formatLagosDate(parsed)}</h1>
          <p className="mt-2 text-ink/60">
            {total} testimon{total === 1 ? "y" : "ies"}
            {preserved > 0 ? ` · ${preserved} preserved` : ""}
          </p>
        </div>
        <Button asChild>
          <Link href={`/share?date=${date}`}>Tell your own story</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/10 p-10 text-center text-ink/60">
          No testimonies yet for this day. Be the first to share.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((testimony) => (
            <TestimonyCard key={testimony.id} testimony={testimony} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-3">
          {page > 1 && (
            <Button asChild variant="secondary">
              <Link href={`/day/${date}?page=${page - 1}`}>Previous</Link>
            </Button>
          )}
          {page < totalPages && (
            <Button asChild variant="secondary">
              <Link href={`/day/${date}?page=${page + 1}`}>Next</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
