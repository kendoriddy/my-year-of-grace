import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
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
  const dataUrl = new URL(`/api/testimonies/${publicId}/og`, request.url);
  const dataResponse = await fetch(dataUrl);

  if (dataResponse.status === 404) {
    return new Response("Not found", { status: 404 });
  }

  if (!dataResponse.ok) {
    return new Response("Failed to load testimony", { status: 502 });
  }

  const testimony = (await dataResponse.json()) as OgTestimony;
  const download = request.nextUrl.searchParams.get("download");
  const locked = testimony.archiveNumber != null && testimony.customSlug;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F7F1E8",
          color: "#1E1A16",
          padding: "64px",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 28,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            My Year of Grace
          </div>
          <div style={{ fontSize: 24, marginTop: 16, opacity: 0.7 }}>
            {formatLagosDate(testimony.occurredOn)}
          </div>
        </div>
        <div style={{ fontSize: 42, lineHeight: 1.3, maxWidth: "900px" }}>
          “{truncate(testimony.content, 220)}”
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
          }}
        >
          <div style={{ opacity: 0.7 }}>Grace</div>
          <div style={{ textAlign: "right" }}>
            {locked
              ? formatGraceNumber(testimony.archiveNumber!)
              : "Shared in 2026"}
            <div style={{ fontSize: 20, marginTop: 8, opacity: 0.7 }}>
              {locked
                ? `myyearofgrace.com/${testimony.customSlug}`
                : `myyearofgrace.com/t/${publicId}`}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: download
        ? {
            "Content-Disposition": `attachment; filename="my-year-of-grace-${publicId}.png"`,
          }
        : undefined,
    },
  );
}
