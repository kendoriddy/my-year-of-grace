import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { getApprovedTestimony } from "@/lib/testimonies";
import { formatLagosDate } from "@/lib/timezone";
import { formatGraceNumber, truncate } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params;
  const testimony = await getApprovedTestimony(publicId);

  if (!testimony) {
    return new Response("Not found", { status: 404 });
  }

  const locked = testimony.lockedArchive;
  const download = request.nextUrl.searchParams.get("download");

  return new ImageResponse(
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
          style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase" }}
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
        <div>🙏</div>
        <div style={{ textAlign: "right" }}>
          {locked ? formatGraceNumber(locked.archiveNumber) : "Shared in 2026"}
          <div style={{ fontSize: 20, marginTop: 8, opacity: 0.7 }}>
            {locked
              ? `myyearofgrace.com/${locked.customSlug}`
              : `myyearofgrace.com/t/${publicId}`}
          </div>
        </div>
      </div>
    </div>,
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
