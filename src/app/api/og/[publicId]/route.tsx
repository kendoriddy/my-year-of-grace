import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { OgCard } from "@/lib/og-card";
import { getOgTheme } from "@/lib/og-themes";
import { formatLagosDate } from "@/lib/timezone";
import { formatGraceNumber, truncate } from "@/lib/utils";

export const runtime = "edge";

type OgTestimony = {
  publicId: string;
  content: string;
  occurredOn: string;
  archiveNumber: number | null;
  customSlug: string | null;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params;
  const theme = getOgTheme(request.nextUrl.searchParams.get("theme"));
  const download = request.nextUrl.searchParams.get("download");

  const dataUrl = new URL(`/api/testimonies/${publicId}/og`, request.url);
  const dataResponse = await fetch(dataUrl);

  if (dataResponse.status === 404) {
    return new Response("Not found", { status: 404 });
  }

  if (!dataResponse.ok) {
    return new Response("Failed to load testimony", { status: 502 });
  }

  const testimony = (await dataResponse.json()) as OgTestimony;
  const locked = testimony.archiveNumber != null && testimony.customSlug;

  const image = new ImageResponse(
    (
      <OgCard
        theme={theme}
        dateLabel={formatLagosDate(testimony.occurredOn)}
        quote={truncate(testimony.content, 220)}
        footerLabel={
          locked
            ? formatGraceNumber(testimony.archiveNumber!)
            : "Shared in 2026"
        }
        urlLabel={
          locked
            ? `myyearofgrace.com/${testimony.customSlug}`
            : `myyearofgrace.com/t/${publicId}`
        }
      />
    ),
    {
      width: 1200,
      height: 630,
    },
  );

  const png = await image.arrayBuffer();
  if (png.byteLength === 0) {
    return new Response("Failed to generate image", { status: 500 });
  }

  const headers = new Headers({
    "Content-Type": "image/png",
    "Cache-Control": "public, max-age=31536000, immutable",
  });

  if (download) {
    headers.set(
      "Content-Disposition",
      `attachment; filename="my-year-of-grace-${publicId}-${theme.id}.png"`,
    );
  }

  return new Response(png, { headers });
}
