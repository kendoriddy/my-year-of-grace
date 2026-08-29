import { prisma } from "@/lib/db";
import { TestimonyStatus } from "@/generated/prisma/client";
import {
  checkDuplicateContent,
  checkRateLimit,
  getClientIp,
  isBlocked,
  recordRateLimit,
} from "@/lib/abuse";
import {
  generateManageToken,
  generatePublicId,
  hashContent,
  hashIp,
  hashManageToken,
} from "@/lib/crypto";
import { moderateContent } from "@/lib/moderation";
import { isDateIn2026, parseDateParam } from "@/lib/timezone";
import { z } from "zod";

export const testimonySchema = z.object({
  content: z.string().trim().min(10).max(1000),
  occurredOn: z.string(),
  categoryId: z.string().min(1),
  displayName: z.string().trim().max(80).optional(),
  location: z.string().trim().max(80).optional(),
  email: z.string().email().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isAnonymous: z.boolean().default(false),
});

export type TestimonyInput = z.infer<typeof testimonySchema>;

export async function createTestimony(input: TestimonyInput) {
  const parsed = testimonySchema.parse(input);
  const ip = await getClientIp();

  if (await isBlocked(ip, parsed.email || null)) {
    throw new Error("You are not allowed to submit testimonies.");
  }

  const rate = await checkRateLimit(ip, "submit_testimony", {
    perHour: 5,
    perDay: 20,
  });
  if (!rate.allowed) {
    throw new Error(rate.reason || "Rate limit exceeded.");
  }

  const occurredOnParts = parsed.occurredOn.split("-").map(Number);
  if (occurredOnParts.length !== 3) {
    throw new Error("Date must be within 2026.");
  }
  const [year, month, day] = occurredOnParts;
  const occurredOn = new Date(Date.UTC(year, month - 1, day));
  if (!isDateIn2026(occurredOn)) {
    throw new Error("Date must be within 2026.");
  }

  const contentHash = hashContent(parsed.content);
  if (await checkDuplicateContent(contentHash)) {
    throw new Error("This testimony looks like a duplicate submission.");
  }

  const moderation = await moderateContent(parsed.content);
  const status = moderation.approved
    ? TestimonyStatus.approved
    : TestimonyStatus.flagged;

  const manageToken = generateManageToken();
  const manageTokenHash = await hashManageToken(manageToken);
  const publicId = generatePublicId();

  const testimony = await prisma.testimony.create({
    data: {
      publicId,
      manageTokenHash,
      email: parsed.email || null,
      occurredOn,
      categoryId: parsed.categoryId,
      content: parsed.content,
      displayName: parsed.isAnonymous ? null : parsed.displayName || null,
      location: parsed.location || null,
      imageUrl: parsed.imageUrl || null,
      isAnonymous: parsed.isAnonymous,
      status,
      contentHash,
      ipHash: hashIp(ip),
    },
    include: { category: true },
  });

  await recordRateLimit(ip, "submit_testimony");

  return { testimony, manageToken, publicId };
}

export async function getTestimonyByPublicId(publicId: string) {
  return prisma.testimony.findUnique({
    where: { publicId },
    include: {
      category: true,
      lockedArchive: true,
    },
  });
}

export async function getApprovedTestimony(publicId: string) {
  return prisma.testimony.findFirst({
    where: { publicId, status: TestimonyStatus.approved },
    include: {
      category: true,
      lockedArchive: true,
    },
  });
}

export async function getTestimoniesForDay(dateKey: string) {
  const date = parseDateParam(dateKey);
  if (!date) return [];

  return prisma.testimony.findMany({
    where: {
      occurredOn: date,
      status: TestimonyStatus.approved,
    },
    include: {
      category: true,
      lockedArchive: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecentTestimonies(limit = 6) {
  return prisma.testimony.findMany({
    where: { status: TestimonyStatus.approved },
    include: {
      category: true,
      lockedArchive: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getLockedArchiveEntries(filters: {
  month?: string;
  categoryId?: string;
  location?: string;
  search?: string;
}) {
  const where: Record<string, unknown> = {
    testimony: { status: TestimonyStatus.approved },
    slugDisabled: false,
  };

  if (filters.categoryId) {
    where.testimony = {
      ...(where.testimony as object),
      categoryId: filters.categoryId,
    };
  }

  if (filters.location) {
    where.testimony = {
      ...(where.testimony as object),
      location: { contains: filters.location, mode: "insensitive" },
    };
  }

  if (filters.search) {
    where.testimony = {
      ...(where.testimony as object),
      content: { contains: filters.search, mode: "insensitive" },
    };
  }

  if (filters.month) {
    const month = Number(filters.month);
    const start = new Date(Date.UTC(2026, month - 1, 1));
    const end = new Date(Date.UTC(2026, month, 0));
    where.testimony = {
      ...(where.testimony as object),
      occurredOn: { gte: start, lte: end },
    };
  }

  return prisma.lockedArchive.findMany({
    where,
    include: {
      testimony: { include: { category: true } },
    },
    orderBy: { archiveNumber: "asc" },
    take: 100,
  });
}

export async function getLockedBySlug(slug: string) {
  return prisma.lockedArchive.findFirst({
    where: { customSlug: slug, slugDisabled: false },
    include: {
      testimony: { include: { category: true } },
    },
  });
}

export async function getGraceOfTheDay() {
  const featured = await prisma.testimony.findFirst({
    where: {
      status: TestimonyStatus.approved,
      isFeatured: true,
    },
    include: {
      category: true,
      lockedArchive: true,
    },
    orderBy: [{ featuredOn: "desc" }, { createdAt: "desc" }],
  });

  if (featured) return featured;

  return prisma.testimony.findFirst({
    where: { status: TestimonyStatus.approved },
    include: {
      category: true,
      lockedArchive: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDiscoverTestimonies(filters: {
  month?: string;
  categoryId?: string;
  location?: string;
  page?: number;
}) {
  const page = Math.max(1, filters.page ?? 1);
  const take = 24;
  const where: Record<string, unknown> = {
    status: TestimonyStatus.approved,
  };

  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.location) {
    where.location = { contains: filters.location, mode: "insensitive" };
  }
  if (filters.month) {
    const month = Number(filters.month);
    where.occurredOn = {
      gte: new Date(Date.UTC(2026, month - 1, 1)),
      lte: new Date(Date.UTC(2026, month, 0)),
    };
  }

  const [items, total] = await Promise.all([
    prisma.testimony.findMany({
      where,
      include: { category: true, lockedArchive: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * take,
      take,
    }),
    prisma.testimony.count({ where }),
  ]);

  return { items, total, page, take };
}

export async function getTestimoniesForDayPaged(
  dateKey: string,
  page = 1,
) {
  const date = parseDateParam(dateKey);
  if (!date) return { items: [], total: 0, page: 1, take: 24 };

  const take = 24;
  const where = {
    occurredOn: date,
    status: TestimonyStatus.approved,
  };

  const [items, total] = await Promise.all([
    prisma.testimony.findMany({
      where,
      include: { category: true, lockedArchive: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * take,
      take,
    }),
    prisma.testimony.count({ where }),
  ]);

  return { items, total, page, take };
}
