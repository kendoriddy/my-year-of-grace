import Link from "next/link";
import { Suspense } from "react";
import { EmberSection } from "@/components/ember-section";
import { GraceOfTheDay } from "@/components/grace-of-the-day";
import { LiveStats } from "@/components/live-stats";
import { TestimonyCard } from "@/components/testimony-card";
import { YearCalendar } from "@/components/year-calendar";
import { Button } from "@/components/ui/button";
import { getArchiveStats, getYearCalendarCounts } from "@/lib/stats";
import { getRecentTestimonies } from "@/lib/testimonies";
import { getLockPriceKobo, getSetting } from "@/lib/settings";
import { nowInLagos } from "@/lib/timezone";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const currentMonth = nowInLagos().getMonth() + 1;
  const [countsMap, recent, archiveStats, priceKobo, announcement] =
    await Promise.all([
      getYearCalendarCounts(),
      getRecentTestimonies(6),
      getArchiveStats(),
      getLockPriceKobo(),
      getSetting("homepageAnnouncement"),
    ]);

  const counts = Object.fromEntries(countsMap.entries());

  return (
    <>
      <section className="relative overflow-hidden px-4 py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(181,106,69,0.12),transparent_55%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex rounded-full border border-ink/10 bg-white/70 px-4 py-1 text-xs uppercase tracking-wide text-ink/60">
            {announcement}
          </span>
          <h1 className="mt-6 font-serif text-5xl leading-tight text-ink md:text-7xl">
            MY YEAR OF GRACE
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink/70 md:text-xl">
            Before the year ends, tell us what God has done.
          </p>
          <div className="mx-auto mt-8 max-w-xl space-y-2 text-ink/60">
            <p>The answered prayers.</p>
            <p>The unexpected blessings.</p>
            <p>The protection.</p>
            <p>The people you met.</p>
            <p>The doors that opened.</p>
            <p>The moments you thought would never happen.</p>
            <p className="pt-2 font-medium text-ink">What are you grateful for?</p>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/share">Tell My Testimony</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="#calendar">Explore 2026</Link>
            </Button>
          </div>
        </div>
      </section>

      <LiveStats />
      <GraceOfTheDay />

      <Suspense fallback={<div className="py-16 text-center">Loading calendar...</div>}>
        <YearCalendar counts={counts} initialMonth={currentMonth} />
      </Suspense>

      {recent.length > 0 && (
        <section className="bg-white/40 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="font-serif text-3xl text-ink">Recent testimonies</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recent.map((testimony) => (
                <TestimonyCard key={testimony.id} testimony={testimony} />
              ))}
            </div>
          </div>
        </section>
      )}

      <EmberSection />

      <section className="py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-ember/20 bg-ember/5 px-6 py-10 text-center">
          <p className="text-sm uppercase tracking-wide text-ember">2026 Grace Archive</p>
          <h2 className="mt-3 font-serif text-3xl text-ink">
            {archiveStats.isFull
              ? "The 2026 Grace Archive is now full."
              : `${archiveStats.claimed.toLocaleString()} / ${archiveStats.capacity.toLocaleString()} preserved`}
          </h2>
          {!archiveStats.isFull && (
            <p className="mt-2 text-sm text-ink/60">
              {archiveStats.remaining.toLocaleString()} preserved places remaining.
            </p>
          )}
          <p className="mt-6 text-ink/70">
            Your testimony deserves its own place on the internet.
          </p>
          <p className="mt-2 text-sm text-ink/60">
            Some moments are too important to leave behind.
          </p>
          {!archiveStats.isFull && (
            <Button asChild variant="ember" className="mt-6">
              <Link href="/share">
                Preserve it forever — {formatNaira(priceKobo)}
              </Link>
            </Button>
          )}
        </div>
      </section>

      <section className="px-4 pb-20 pt-8 text-center">
        <h2 className="font-serif text-3xl text-ink">Tell your story. It&apos;s free.</h2>
        <Button asChild className="mt-6">
          <Link href="/share">Share Your Testimony</Link>
        </Button>
      </section>
    </>
  );
}
