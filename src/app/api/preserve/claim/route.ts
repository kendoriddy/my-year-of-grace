import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { MANAGE_COOKIE } from "@/lib/constants";
import {
  checkRateLimit,
  getClientIp,
  recordRateLimit,
} from "@/lib/abuse";
import { generateManageToken, hashManageToken } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { getApprovedTestimony } from "@/lib/testimonies";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      publicId?: string;
      email?: string;
    };

    const publicId = body.publicId?.trim();
    const email = body.email?.trim().toLowerCase();
    if (!publicId || !email) {
      return NextResponse.json({ error: "Enter your email." }, { status: 400 });
    }

    const ip = await getClientIp();
    const rate = await checkRateLimit(ip, "preserve_claim", {
      perHour: 8,
      perDay: 20,
    });
    if (!rate.allowed) {
      return NextResponse.json(
        { error: rate.reason || "Too many attempts." },
        { status: 429 },
      );
    }
    await recordRateLimit(ip, "preserve_claim");

    const testimony = await getApprovedTestimony(publicId);
    const stored = testimony?.email?.trim().toLowerCase();
    const canClaim =
      Boolean(testimony) &&
      !testimony?.isLocked &&
      Boolean(stored) &&
      stored === email;

    if (canClaim && testimony) {
      const manageToken = generateManageToken();
      const manageTokenHash = await hashManageToken(manageToken);
      await prisma.testimony.update({
        where: { id: testimony.id },
        data: { manageTokenHash },
      });

      const cookieStore = await cookies();
      const existing = cookieStore.get(MANAGE_COOKIE)?.value;
      const tokens = existing
        ? (JSON.parse(existing) as Record<string, string>)
        : {};
      tokens[publicId] = manageToken;
      cookieStore.set(MANAGE_COOKIE, JSON.stringify(tokens), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
