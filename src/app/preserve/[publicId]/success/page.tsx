import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ShareButtons } from "@/components/share-buttons";
import { ShareCard } from "@/components/share-card";
import { KeepsakePage } from "@/components/keepsake-page";
import { SlugPicker } from "@/components/lock-checkout";
import { Button } from "@/components/ui/button";
import { finalizeLockFromPayment } from "@/lib/lock";
import { getApprovedTestimony } from "@/lib/testimonies";
import { suggestSlugs } from "@/lib/slugs";
import { formatGraceNumber } from "@/lib/utils";
import { getSetting } from "@/lib/settings";
import { CANONICAL_DOMAIN } from "@/lib/env";

export const metadata = {
  robots: { index: false, follow: false },
  title: "Your testimony is preserved",
};

export default async function PreserveSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ reference?: string }>;
}) {
  const { publicId } = await params;
  const query = await searchParams;
  const testimony = await getApprovedTestimony(publicId);
  if (!testimony) notFound();

  if (query.reference && typeof query.reference === "string") {
    try {
      await finalizeLockFromPayment(query.reference);
    } catch {
      // Payment may already be finalized via webhook
    }
  }

  const refreshed = await getApprovedTestimony(publicId);
  if (!refreshed?.isLocked || !refreshed.lockedArchive) {
    redirect(`/preserve/${publicId}`);
  }

  const stillDefaultSlug = refreshed.lockedArchive.customSlug.startsWith("grace-");
  const suggestions = stillDefaultSlug
    ? await suggestSlugs(refreshed.displayName || "grace")
    : [];
  const giftTeaser = await getSetting("giftTeaser");
  const author = refreshed.isAnonymous
    ? "Anonymous"
    : refreshed.displayName || "Anonymous";
  const pageUrl = `https://${CANONICAL_DOMAIN}/${refreshed.lockedArchive.customSlug}`;

  return (
    <div>
      <section className="mx-auto max-w-3xl px-4 py-14 text-center">
        <p className="text-sm text-terracotta">Your testimony is preserved.</p>
        <h1 className="mt-4 font-serif text-4xl text-ink md:text-5xl">
          Your story now has its own place on the internet.
        </h1>
        <p className="mt-4 font-serif text-2xl text-ember">
          {formatGraceNumber(refreshed.lockedArchive.archiveNumber)}
        </p>
        <p className="mt-3 text-lg text-ink/70">{pageUrl.replace("https://", "")}</p>
      </section>

      <div className="overflow-hidden rounded-[2rem] border border-ink/10 mx-3 md:mx-8">
        <KeepsakePage
          testimony={{
            content: refreshed.content,
            occurredOn: refreshed.occurredOn,
            author,
            location: refreshed.location,
            imageUrl: refreshed.imageUrl,
            archiveNumber: refreshed.lockedArchive.archiveNumber,
            customSlug: refreshed.lockedArchive.customSlug,
            paletteId: refreshed.lockedArchive.themeId || refreshed.themeId,
          }}
          showAcquisition={false}
        />
      </div>

      <section className="mx-auto max-w-3xl px-4 py-14">
        <div className="rounded-3xl border border-ink/10 bg-white p-6 md:p-8">
          <p className="font-serif text-2xl text-ink">
            Don&apos;t keep your testimony to yourself.
          </p>
          <p className="mt-2 text-ink/65">
            Share your Grace Card and invite someone else to tell their story.
          </p>
          <p className="mt-4 text-sm text-ink/55">
            Ask someone: &ldquo;What are you grateful to God for this year?&rdquo;
          </p>

          <div className="mt-8">
            <ShareButtons
              publicId={publicId}
              content={refreshed.content}
              customUrl={refreshed.lockedArchive.customSlug}
              locked
              prominent
            />
          </div>

          <div className="mt-8">
            <ShareCard
              publicId={publicId}
              locked
              themeId={refreshed.lockedArchive.themeId}
            />
          </div>
        </div>

        {stillDefaultSlug && (
          <SlugPicker publicId={publicId} suggestions={suggestions} />
        )}

        <div className="mt-8 rounded-3xl border border-ember/20 bg-ember/5 p-6 text-center">
          <p className="font-serif text-2xl text-ink">
            Something special is waiting for you.
          </p>
          <p className="mt-3 text-sm text-ink/70">{giftTeaser}</p>
        </div>

        <div className="mt-8 text-center">
          <Button asChild>
            <Link href={`/${refreshed.lockedArchive.customSlug}`}>
              Open your public page
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
