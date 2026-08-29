import { redirect } from "next/navigation";
import { getApprovedTestimony } from "@/lib/testimonies";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function LockPage({ params }: PageProps<"/lock/[publicId]">) {
  const { publicId } = await params;
  const testimony = await getApprovedTestimony(publicId);
  if (!testimony) redirect(`/t/${publicId}`);
  if (testimony.isLocked) {
    redirect(`/${testimony.lockedArchive?.customSlug || `t/${publicId}`}`);
  }
  redirect(`/preserve/${publicId}`);
}
