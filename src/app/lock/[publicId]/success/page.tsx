import { notFound, redirect } from "next/navigation";
import { SlugPicker } from "@/components/lock-checkout";
import { finalizeLockFromPayment } from "@/lib/lock";
import { getApprovedTestimony } from "@/lib/testimonies";
import { suggestSlugs } from "@/lib/slugs";
import { formatGraceNumber } from "@/lib/utils";
import { getSetting } from "@/lib/settings";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function LockSuccessPage({
  params,
  searchParams,
}: PageProps<"/lock/[publicId]/success">) {
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
    redirect(`/lock/${publicId}`);
  }

  const baseName = refreshed.displayName || "grace";
  const suggestions = await suggestSlugs(baseName);
  const giftTeaser = await getSetting("giftTeaser");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-center text-sm text-terracotta">
        Your testimony is now part of the 2026 Year of Grace. 🙏
      </p>
      <h1 className="mt-4 text-center font-serif text-4xl text-ink">
        {formatGraceNumber(refreshed.lockedArchive.archiveNumber)}
      </h1>
      <p className="mt-4 text-center text-ink/70">
        Your permanent page: myyearofgrace.com/{refreshed.lockedArchive.customSlug}
      </p>

      <SlugPicker publicId={publicId} suggestions={suggestions} />

      <div className="mt-10 rounded-2xl border border-ember/20 bg-ember/5 p-6 text-center">
        <p className="text-lg">🎁 Something is waiting for you.</p>
        <p className="mt-3 text-sm text-ink/70">{giftTeaser}</p>
      </div>
    </div>
  );
}
