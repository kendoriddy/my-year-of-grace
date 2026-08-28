import Link from "next/link";
import { notFound } from "next/navigation";
import { TestimonyCard } from "@/components/testimony-card";
import { Button } from "@/components/ui/button";
import { getTestimoniesForDay } from "@/lib/testimonies";
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

export default async function DayPage({ params }: PageProps<"/day/[date]">) {
  const { date } = await params;
  const parsed = parseDateParam(date);
  if (!parsed) notFound();

  const testimonies = await getTestimoniesForDay(date);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-ink/50">Day in 2026</p>
          <h1 className="font-serif text-4xl text-ink">{formatLagosDate(parsed)}</h1>
          <p className="mt-2 text-ink/60">
            {testimonies.length} testimon{testimonies.length === 1 ? "y" : "ies"}
          </p>
        </div>
        <Button asChild>
          <Link href={`/share?date=${date}`}>Share for this date</Link>
        </Button>
      </div>

      {testimonies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/10 p-10 text-center text-ink/60">
          No testimonies yet for this day. Be the first to share.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonies.map((testimony) => (
            <TestimonyCard key={testimony.id} testimony={testimony} />
          ))}
        </div>
      )}
    </div>
  );
}
