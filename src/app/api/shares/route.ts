import { NextResponse } from "next/server";
import { SharePlatform } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      publicId?: string;
      platform?: SharePlatform;
    };

    if (!body.publicId || !body.platform) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const testimony = await prisma.testimony.findUnique({
      where: { publicId: body.publicId },
    });

    if (!testimony) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    await prisma.share.create({
      data: {
        testimonyId: testimony.id,
        platform: body.platform,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to record share." }, { status: 500 });
  }
}
