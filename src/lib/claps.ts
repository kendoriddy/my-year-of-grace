import { nanoid } from "nanoid";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  MAX_CLAPS_PER_VISITOR,
  VISITOR_COOKIE,
} from "@/lib/constants";
import { hashIp } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import {
  checkRateLimit,
  getClientIp,
  recordRateLimit,
} from "@/lib/abuse";

const VISITOR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

export async function getVisitorId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(VISITOR_COOKIE)?.value;
}

export function attachVisitorCookie(
  response: NextResponse,
  visitorId: string,
) {
  response.cookies.set(VISITOR_COOKIE, visitorId, VISITOR_COOKIE_OPTIONS);
}

export async function getClapStats(publicId: string, visitorId?: string) {
  const testimony = await prisma.testimony.findUnique({
    where: { publicId },
    select: { id: true, clapCount: true },
  });
  if (!testimony) return null;

  let yourClaps = 0;
  if (visitorId) {
    yourClaps = await prisma.clap.count({
      where: { testimonyId: testimony.id, visitorId },
    });
  }

  return {
    clapCount: testimony.clapCount,
    yourClaps,
    remaining: Math.max(0, MAX_CLAPS_PER_VISITOR - yourClaps),
  };
}

export async function recordClap(publicId: string) {
  const testimony = await prisma.testimony.findUnique({
    where: { publicId },
    select: { id: true, clapCount: true },
  });
  if (!testimony) {
    return { error: "Not found.", status: 404 as const };
  }

  const ip = await getClientIp();
  const rate = await checkRateLimit(ip, "clap", {
    perHour: 60,
    perDay: 400,
  });
  if (!rate.allowed) {
    return {
      error: rate.reason || "Rate limit exceeded.",
      status: 429 as const,
    };
  }

  let visitorId = await getVisitorId();
  const isNewVisitor = !visitorId;
  if (!visitorId) {
    visitorId = nanoid(21);
  }

  const yourClaps = await prisma.clap.count({
    where: { testimonyId: testimony.id, visitorId },
  });

  if (yourClaps >= MAX_CLAPS_PER_VISITOR) {
    return {
      error: "You've reached the clap limit for this testimony.",
      status: 429 as const,
      clapCount: testimony.clapCount,
      yourClaps,
      remaining: 0,
    };
  }

  const [, updated] = await prisma.$transaction([
    prisma.clap.create({
      data: {
        testimonyId: testimony.id,
        visitorId,
        ipHash: hashIp(ip),
      },
    }),
    prisma.testimony.update({
      where: { id: testimony.id },
      data: { clapCount: { increment: 1 } },
      select: { clapCount: true },
    }),
  ]);

  await recordRateLimit(ip, "clap");

  return {
    ok: true as const,
    clapCount: updated.clapCount,
    yourClaps: yourClaps + 1,
    remaining: Math.max(0, MAX_CLAPS_PER_VISITOR - (yourClaps + 1)),
    visitorId: isNewVisitor ? visitorId : undefined,
  };
}
