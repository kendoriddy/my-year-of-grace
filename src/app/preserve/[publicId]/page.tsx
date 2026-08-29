import { notFound, redirect } from "next/navigation";
import { PreserveExperience } from "@/components/preserve-experience";
import { canManageTestimony } from "@/lib/auth";
import { getTestimonyByPublicId } from "@/lib/testimonies";
import { getArchiveStats } from "@/lib/stats";
import { getLockPriceKobo } from "@/lib/settings";
import { suggestSlugs } from "@/lib/slugs";

export const metadata = {
  robots: { index: false, follow: false },
  title: "Preview your preserved testimony",
};

export default async function PreservePage({
  params,
  searchParams,
}: {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { publicId } = await params;
  const query = await searchParams;
  const testimony = await getTestimonyByPublicId(publicId);
  if (!testimony) notFound();

  if (testimony.isLocked) {
    redirect(`/${testimony.lockedArchive?.customSlug || `t/${publicId}`}`);
  }

  if (!(await canManageTestimony(publicId))) {
    redirect(`/t/${publicId}`);
  }

  const [archiveStats, priceKobo, suggestions] = await Promise.all([
    getArchiveStats(),
    getLockPriceKobo(),
    suggestSlugs(testimony.displayName || "grace"),
  ]);

  const author = testimony.isAnonymous
    ? "Anonymous"
    : testimony.displayName || "Anonymous";

  return (
    <PreserveExperience
      publicId={publicId}
      content={testimony.content}
      occurredOn={testimony.occurredOn.toISOString()}
      author={author}
      location={testimony.location}
      imageUrl={testimony.imageUrl}
      email={testimony.email}
      initialSlug={testimony.preferredSlug || suggestions[0]}
      initialThemeId={testimony.themeId}
      priceKobo={priceKobo}
      remaining={archiveStats.remaining}
      capacity={archiveStats.capacity}
      submitted={query.submitted === "1"}
    />
  );
}
