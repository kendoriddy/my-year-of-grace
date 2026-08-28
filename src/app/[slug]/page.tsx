import { notFound } from "next/navigation";
import { TestimonyView } from "@/components/testimony-view";
import { getLockedBySlug } from "@/lib/testimonies";
import { CANONICAL_DOMAIN } from "@/lib/env";
import { formatGraceNumber } from "@/lib/utils";
import { isSlugReserved } from "@/lib/slugs";

export async function generateMetadata({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const entry = await getLockedBySlug(slug);
  if (!entry) return { title: "Not found" };

  const author = entry.testimony.isAnonymous
    ? "Anonymous"
    : entry.testimony.displayName || "Anonymous";

  return {
    title: `${formatGraceNumber(entry.archiveNumber)} — ${author}`,
    description: entry.testimony.content.slice(0, 160),
    openGraph: {
      images: [`https://${CANONICAL_DOMAIN}/api/og/${entry.testimony.publicId}`],
    },
    alternates: {
      canonical: `https://${CANONICAL_DOMAIN}/${slug}`,
    },
  };
}

export default async function LockedSlugPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  if (await isSlugReserved(slug)) notFound();
  const entry = await getLockedBySlug(slug);
  if (!entry) notFound();

  return (
    <TestimonyView
      testimony={{
        ...entry.testimony,
        lockedArchive: {
          archiveNumber: entry.archiveNumber,
          customSlug: entry.customSlug,
        },
      }}
      showLockCta={false}
    />
  );
}
