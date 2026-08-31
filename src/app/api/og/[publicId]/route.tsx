import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { OgCard } from "@/lib/og-card";
import { getOgTheme } from "@/lib/og-themes";
import { getApprovedTestimony } from "@/lib/testimonies";
import { formatLagosDate } from "@/lib/timezone";
import { formatGraceNumber, truncate } from "@/lib/utils";

const RATIOS = {
  og: { width: 1200, height: 630, quote: 220 },
  square: { width: 1080, height: 1080, quote: 200 },
  story: { width: 1080, height: 1920, quote: 280 },
} as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params;
  const ratioParam = request.nextUrl.searchParams.get("ratio");
  const ratio =
    ratioParam === "story" || ratioParam === "square" ? ratioParam : "og";
  const download = request.nextUrl.searchParams.get("download");

  const testimony = await getApprovedTestimony(publicId);
  if (!testimony) {
    return new Response("Not found", { status: 404 });
  }

  const theme = getOgTheme(
    request.nextUrl.searchParams.get("theme") ||
      testimony.lockedArchive?.themeId ||
      testimony.themeId,
  );
  const locked = Boolean(testimony.lockedArchive);
  const customSlug = testimony.lockedArchive?.customSlug;
  const author = testimony.isAnonymous
    ? "Anonymous"
    : testimony.displayName || "Anonymous";
  const size = RATIOS[ratio];

  try {
    const image = new ImageResponse(
      <OgCard
        theme={theme}
        dateLabel={formatLagosDate(testimony.occurredOn)}
        quote={truncate(testimony.content, size.quote)}
        footerLabel={
          locked && testimony.lockedArchive
            ? formatGraceNumber(testimony.lockedArchive.archiveNumber)
            : "Shared in 2026"
        }
        urlLabel={
          locked && customSlug
            ? `myyearofgrace.com/${customSlug}`
            : `myyearofgrace.com/t/${publicId}`
        }
        author={author}
        ratio={ratio}
      />,
      {
        width: size.width,
        height: size.height,
      },
    );

    const png = await image.arrayBuffer();
    if (png.byteLength === 0) {
      return new Response("Failed to generate image", { status: 500 });
    }

    const headers = new Headers({
      "Content-Type": "image/png",
      "Cache-Control":
        download || !locked
          ? "no-store"
          : "public, max-age=3600, stale-while-revalidate=86400",
    });

    if (download) {
      headers.set(
        "Content-Disposition",
        `attachment; filename="my-year-of-grace-${publicId}-${theme.id}-${ratio}.png"`,
      );
    }

    return new Response(png, { headers });
  } catch (error) {
    console.error("Grace Card generation failed:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
