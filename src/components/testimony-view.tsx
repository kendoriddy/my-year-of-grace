import Link from "next/link";
import { ShareButtons } from "@/components/share-buttons";
import { LockCheckout } from "@/components/lock-checkout";
import { Button } from "@/components/ui/button";
import { formatLagosDate } from "@/lib/timezone";
import { formatGraceNumber } from "@/lib/utils";
import { getArchiveStats } from "@/lib/stats";
import { getLockPriceKobo } from "@/lib/settings";
import { canManageTestimony } from "@/lib/auth";
import { APP_URL } from "@/lib/env";

type TestimonyViewProps = {
  testimony: {
    publicId: string;
    content: string;
    occurredOn: Date;
    displayName: string | null;
    location: string | null;
    isAnonymous: boolean;
    email: string | null;
    isLocked: boolean;
    category: { emoji: string; name: string };
    lockedArchive?: {
      archiveNumber: number;
      customSlug: string;
    } | null;
  };
  showLockCta?: boolean;
  submitted?: boolean;
};

export async function TestimonyView({
  testimony,
  showLockCta = true,
  submitted = false,
}: TestimonyViewProps) {
  const author = testimony.isAnonymous
    ? "Anonymous"
    : testimony.displayName || "Anonymous";

  const locked = Boolean(testimony.lockedArchive);
  const canManage = await canManageTestimony(testimony.publicId);
  const [archiveStats, priceKobo] = await Promise.all([
    getArchiveStats(),
    getLockPriceKobo(),
  ]);

  const pageUrl = locked
    ? `${APP_URL}/${testimony.lockedArchive!.customSlug}`
    : `${APP_URL}/t/${testimony.publicId}`;

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      {submitted && (
        <p className="mb-6 rounded-full bg-terracotta/10 px-4 py-2 text-center text-sm text-terracotta">
          Your testimony is now part of the 2026 Year of Grace. 🙏
        </p>
      )}

      {locked && testimony.lockedArchive && (
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-ember">
          {formatGraceNumber(testimony.lockedArchive.archiveNumber)}
        </p>
      )}

      <p className="text-sm text-ink/50">{formatLagosDate(testimony.occurredOn)}</p>
      <p className="mt-2 text-sm text-ink/60">
        {testimony.category.emoji} {testimony.category.name}
      </p>

      <blockquote className="mt-8 font-serif text-3xl leading-relaxed text-ink md:text-4xl">
        “{testimony.content}”
      </blockquote>

      <p className="mt-6 text-lg text-ink/80">
        — {author}
        {testimony.location ? `, ${testimony.location}` : ""}
        {testimony.location?.toLowerCase().includes("nigeria") ||
        ["lagos", "ibadan", "abuja", "port harcourt"].some((city) =>
          testimony.location?.toLowerCase().includes(city),
        )
          ? " 🇳🇬"
          : ""}
      </p>

      {locked && (
        <p className="mt-4 text-sm text-ember">
          🔒 Locked into the 2026 Grace Archive
        </p>
      )}

      <div className="mt-10 space-y-4">
        <ShareButtons
          publicId={testimony.publicId}
          content={testimony.content}
          customUrl={testimony.lockedArchive?.customSlug}
          locked={locked}
        />
        <p className="text-xs text-ink/40">{pageUrl}</p>
      </div>

      {!locked && showLockCta && canManage && !archiveStats.isFull && (
        <div className="mt-12">
          <LockCheckout
            publicId={testimony.publicId}
            priceKobo={priceKobo}
            remaining={archiveStats.remaining}
            capacity={archiveStats.capacity}
            email={testimony.email}
          />
        </div>
      )}

      <div className="mt-12">
        <Button asChild variant="secondary">
          <Link href="/share">🙏 Share Your Own Testimony</Link>
        </Button>
      </div>
    </article>
  );
}
