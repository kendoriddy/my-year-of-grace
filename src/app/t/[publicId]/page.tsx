import { notFound, redirect } from "next/navigation";
import { TestimonyView } from "@/components/testimony-view";
import { getApprovedTestimony } from "@/lib/testimonies";
import { canManageTestimony } from "@/lib/auth";
import { formatLagosDate } from "@/lib/timezone";
import { CANONICAL_DOMAIN } from "@/lib/env";

export async function generateMetadata({ params }: PageProps<"/t/[publicId]">) {
  const { publicId } = await params;
  const testimony = await getApprovedTestimony(publicId);
  if (!testimony) return { title: "Testimony not found" };

  const author = testimony.isAnonymous
    ? "Anonymous"
    : testimony.displayName || "Anonymous";

  return {
    title: `${author}'s Year of Grace — ${formatLagosDate(testimony.occurredOn)}`,
    description: `Read ${author}'s testimony from ${formatLagosDate(testimony.occurredOn)} and discover what God has done in their life.`,
    openGraph: {
      images: [`https://${CANONICAL_DOMAIN}/api/og/${publicId}`],
    },
    alternates: {
      canonical: `https://${CANONICAL_DOMAIN}/t/${publicId}`,
    },
  };
}

export default async function TestimonyPage({
  params,
  searchParams,
}: PageProps<"/t/[publicId]">) {
  const { publicId } = await params;
  const query = await searchParams;
  const testimony = await getApprovedTestimony(publicId);
  if (!testimony) notFound();

  if (query.submitted === "1" && !testimony.isLocked && (await canManageTestimony(publicId))) {
    redirect(`/preserve/${publicId}?submitted=1`);
  }

  return (
    <TestimonyView
      testimony={testimony}
      submitted={query.submitted === "1"}
    />
  );
}
