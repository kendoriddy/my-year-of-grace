import { notFound } from "next/navigation";
import { KeepsakePage } from "@/components/keepsake-page";
import { getLockedBySlug } from "@/lib/testimonies";
import { CANONICAL_DOMAIN } from "@/lib/env";
import { formatLagosDate } from "@/lib/timezone";
import { isSlugReserved } from "@/lib/slugs";

export async function generateMetadata({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const entry = await getLockedBySlug(slug);
  if (!entry) return { title: "Not found" };

  const author = entry.testimony.isAnonymous
    ? "Anonymous"
    : entry.testimony.displayName || "Anonymous";
  const dateLabel = formatLagosDate(entry.testimony.occurredOn);
  const theme = entry.themeId || entry.testimony.themeId || "grace";

  return {
    title: `${author}'s Year of Grace — ${dateLabel}`,
    description: entry.testimony.content.slice(0, 160),
    openGraph: {
      title: `${author}'s Year of Grace — ${dateLabel}`,
      description: entry.testimony.content.slice(0, 160),
      images: [
        `https://${CANONICAL_DOMAIN}/api/og/${entry.testimony.publicId}?theme=${theme}&ratio=og`,
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [
        `https://${CANONICAL_DOMAIN}/api/og/${entry.testimony.publicId}?theme=${theme}&ratio=og`,
      ],
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

  const author = entry.testimony.isAnonymous
    ? "Anonymous"
    : entry.testimony.displayName || "Anonymous";

  return (
    <KeepsakePage
      testimony={{
        content: entry.testimony.content,
        occurredOn: entry.testimony.occurredOn,
        author,
        location: entry.testimony.location,
        imageUrl: entry.testimony.imageUrl,
        archiveNumber: entry.archiveNumber,
        customSlug: entry.customSlug,
        paletteId: entry.themeId || entry.testimony.themeId,
      }}
    />
  );
}
