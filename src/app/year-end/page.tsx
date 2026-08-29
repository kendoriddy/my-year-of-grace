import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getYearEndStats } from "@/lib/stats";
import { isYearEndExperienceOpen } from "@/lib/timezone";
import { getSetting } from "@/lib/settings";
import { getManageTokensFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "2026 — A Year of Grace",
  description: "The 2026 Year of Grace closing experience.",
};

export default async function YearEndPage() {
  if (!isYearEndExperienceOpen()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-serif text-4xl text-ink">Something is coming.</h1>
        <p className="mt-4 text-ink/70">
          On December 31, 2026, we&apos;ll close the year together.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">Return home</Link>
        </Button>
      </div>
    );
  }

  const stats = await getYearEndStats();
  const giftTeaser = await getSetting("giftTeaser");
  const tokens = await getManageTokensFromCookies();
  const publicIds = Object.keys(tokens);

  let hasLocked = false;
  if (publicIds.length > 0) {
    const lockedCount = await prisma.testimony.count({
      where: {
        publicId: { in: publicIds },
        isLocked: true,
      },
    });
    hasLocked = lockedCount > 0;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-20 text-center">
      <p className="text-sm uppercase tracking-wide text-ink/50">December 31, 2026</p>
      <h1 className="mt-4 font-serif text-5xl text-ink">2026 — A YEAR OF GRACE</h1>
      <p className="mt-4 text-xl text-ink/70">You made it.</p>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-ink/10 bg-white/70 p-6">
          <p className="font-serif text-4xl">{stats.totalTestimonies.toLocaleString()}</p>
          <p className="mt-2 text-sm text-ink/60">testimonies</p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white/70 p-6">
          <p className="font-serif text-4xl">{stats.lockedCount.toLocaleString()}</p>
          <p className="mt-2 text-sm text-ink/60">preserved memories</p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white/70 p-6">
          <p className="font-serif text-4xl">{stats.categories.length}</p>
          <p className="mt-2 text-sm text-ink/60">categories of grace</p>
        </div>
      </div>

      <div className="mt-12 text-left">
        <h2 className="font-serif text-2xl text-ink">Categories</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {stats.categories.slice(0, 8).map((item) => (
            <div
              key={item.category!.id}
              className="flex items-center justify-between rounded-xl border border-ink/10 px-4 py-3"
            >
              <span>
                {item.category!.emoji} {item.category!.name}
              </span>
              <span className="text-ink/60">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-12 text-lg text-ink/80">
        Thank you for being part of the 2026 Year of Grace.
      </p>

      {hasLocked && (
        <div className="mt-8 rounded-2xl border border-ember/20 bg-ember/5 p-6">
          <p className="text-lg">Your gift is ready. 🎁</p>
          <p className="mt-3 text-sm text-ink/70">{giftTeaser}</p>
        </div>
      )}

      <Button asChild className="mt-10">
        <Link href="/archive">Visit the Grace Archive</Link>
      </Button>
    </div>
  );
}
