import { NextRequest } from "next/server";
import { getApprovedTestimony } from "@/lib/testimonies";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params;
  const testimony = await getApprovedTestimony(publicId);

  if (!testimony) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({
    publicId: testimony.publicId,
    content: testimony.content,
    occurredOn: testimony.occurredOn.toISOString(),
    archiveNumber: testimony.lockedArchive?.archiveNumber ?? null,
    customSlug: testimony.lockedArchive?.customSlug ?? null,
    themeId: testimony.lockedArchive?.themeId ?? testimony.themeId,
    displayName: testimony.isAnonymous
      ? "Anonymous"
      : testimony.displayName || "Anonymous",
    location: testimony.location,
  });
}
