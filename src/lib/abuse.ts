import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { hashIp } from "@/lib/crypto";

export async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown"
  );
}

export async function isBlocked(
  ip: string,
  email?: string | null,
): Promise<boolean> {
  const ipHash = hashIp(ip);
  const blocked = await prisma.blockedIdentity.findFirst({
    where: {
      OR: [{ ipHash }, ...(email ? [{ email: email.toLowerCase() }] : [])],
    },
  });
  return Boolean(blocked);
}

export async function checkRateLimit(
  ip: string,
  action: string,
  limits: { perHour: number; perDay: number },
): Promise<{ allowed: boolean; reason?: string }> {
  const key = hashIp(ip);
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [hourCount, dayCount] = await Promise.all([
    prisma.rateLimitEntry.count({
      where: { key, action, createdAt: { gte: hourAgo } },
    }),
    prisma.rateLimitEntry.count({
      where: { key, action, createdAt: { gte: dayAgo } },
    }),
  ]);

  if (hourCount >= limits.perHour) {
    return {
      allowed: false,
      reason: "Too many requests this hour. Please try again later.",
    };
  }
  if (dayCount >= limits.perDay) {
    return {
      allowed: false,
      reason: "Daily limit reached. Please try again tomorrow.",
    };
  }

  return { allowed: true };
}

export async function recordRateLimit(ip: string, action: string) {
  await prisma.rateLimitEntry.create({
    data: { key: hashIp(ip), action },
  });
}

export async function checkDuplicateContent(
  contentHash: string,
): Promise<boolean> {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const existing = await prisma.testimony.findFirst({
    where: {
      contentHash,
      createdAt: { gte: dayAgo },
    },
  });
  return Boolean(existing);
}
