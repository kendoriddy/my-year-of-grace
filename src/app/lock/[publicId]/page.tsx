import { notFound, redirect } from "next/navigation";
import { LockCheckout } from "@/components/lock-checkout";
import { getArchiveStats } from "@/lib/stats";
import { getLockPriceKobo } from "@/lib/settings";
import { getApprovedTestimony } from "@/lib/testimonies";
import { canManageTestimony } from "@/lib/auth";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function LockPage({ params }: PageProps<"/lock/[publicId]">) {
  const { publicId } = await params;
  const testimony = await getApprovedTestimony(publicId);
  if (!testimony) notFound();

  if (testimony.isLocked) {
    redirect(`/${testimony.lockedArchive?.customSlug || `/t/${publicId}`}`);
  }

  if (!(await canManageTestimony(publicId))) {
    redirect(`/t/${publicId}`);
  }

  const [archiveStats, priceKobo] = await Promise.all([
    getArchiveStats(),
    getLockPriceKobo(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <LockCheckout
        publicId={publicId}
        priceKobo={priceKobo}
        remaining={archiveStats.remaining}
        capacity={archiveStats.capacity}
        email={testimony.email}
      />
    </div>
  );
}
