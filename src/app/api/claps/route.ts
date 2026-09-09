import { NextResponse } from "next/server";
import { getClapStats, getVisitorId, recordClap, attachVisitorCookie } from "@/lib/claps";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");
    if (!publicId) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const visitorId = await getVisitorId();
    const stats = await getClapStats(publicId, visitorId);
    if (!stats) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    return NextResponse.json(stats);
  } catch {
    return NextResponse.json(
      { error: "Unable to load claps." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { publicId?: string };
    if (!body.publicId) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const result = await recordClap(body.publicId);
    if ("error" in result) {
      return NextResponse.json(
        {
          error: result.error,
          clapCount: result.clapCount,
          yourClaps: result.yourClaps,
          remaining: result.remaining,
        },
        { status: result.status },
      );
    }

    const response = NextResponse.json({
      ok: true,
      clapCount: result.clapCount,
      yourClaps: result.yourClaps,
      remaining: result.remaining,
    });

    if (result.visitorId) {
      attachVisitorCookie(response, result.visitorId);
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: "Unable to record clap." },
      { status: 500 },
    );
  }
}
