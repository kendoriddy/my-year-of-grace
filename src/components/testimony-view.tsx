import Link from "next/link";
import { PreserveBenefits } from "@/components/preserve-benefits";
import { ShareButtons } from "@/components/share-buttons";
import { ShareCard } from "@/components/share-card";
import { Button } from "@/components/ui/button";
import { formatLagosDate } from "@/lib/timezone";
import { formatGraceNumber, formatNaira, slugify } from "@/lib/utils";
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
      themeId?: string | null;
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
          Your testimony has been added.
        </p>
      )}

      {locked && testimony.lockedArchive && (
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-ember">
          {formatGraceNumber(testimony.lockedArchive.archiveNumber)}
        </p>
      )}

      <p className="text-sm text-ink/50">
        {formatLagosDate(testimony.occurredOn)}
      </p>
      <p className="mt-2 text-sm text-ink/60">
        {testimony.category.emoji} {testimony.category.name}
      </p>

      <blockquote className="mt-8 font-serif text-3xl leading-relaxed text-ink md:text-4xl">
        “{testimony.content}”
      </blockquote>

      <p className="mt-6 text-lg text-ink/80">
        — {author}
        {testimony.location ? `, ${testimony.location}` : ""}
      </p>

      {locked && (
        <p className="mt-4 text-sm text-ember">
          Preserved in the 2026 Grace Archive
        </p>
      )}

      {!locked && showLockCta && !archiveStats.isFull && (
        <div className="mt-8">
          <Button asChild variant="ember" size="lg">
            <Link href={`/preserve/${testimony.publicId}`}>
              {canManage ? "Preserve it forever" : "Preserve it"}
            </Link>
          </Button>
        </div>
      )}

      <div className="mt-10 space-y-6">
        <ShareCard
          publicId={testimony.publicId}
          locked={locked}
          themeId={testimony.lockedArchive?.themeId}
        />
        <ShareButtons
          publicId={testimony.publicId}
          content={testimony.content}
          customUrl={testimony.lockedArchive?.customSlug}
          locked={locked}
        />
        <p className="text-xs text-ink/40">{pageUrl}</p>
      </div>

      {!locked && showLockCta && !archiveStats.isFull && (
        <div className="mt-12 rounded-[2rem] border border-ember/20 bg-ember/5 p-6 text-center md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-ember">
            {canManage ? "Preserve it forever" : "Is this your testimony?"}
          </p>
          <h2 className="mt-3 font-serif text-2xl text-ink">
            {canManage
              ? "Your testimony deserves its own place on the internet."
              : "Preserve it forever."}
          </h2>
          <p className="mt-3 text-sm text-ink/65">
            {canManage
              ? `Preview your custom page, then give it a permanent home for ${formatNaira(priceKobo)}.`
              : "If this story is yours, give it a permanent home in the 2026 Grace Archive."}
          </p>
          <PreserveBenefits
            slug={
              testimony.isAnonymous
                ? undefined
                : slugify(testimony.displayName || "")
            }
          />
          <p className="mt-8 text-xs text-ink/50">
            {archiveStats.remaining.toLocaleString()} places remaining
          </p>
          <Button asChild variant="ember" className="mt-6">
            <Link href={`/preserve/${testimony.publicId}`}>
              {canManage
                ? `Preserve my testimony — ${formatNaira(priceKobo)}`
                : "Preserve it"}
            </Link>
          </Button>
        </div>
      )}

      <div className="mt-12 flex flex-wrap gap-3">
        <Button asChild variant="secondary">
          <Link href="/share">Tell your own story</Link>
        </Button>
      </div>
    </article>
  );
}
