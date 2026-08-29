import { prisma } from "@/lib/db";
import { TestimonyStatus } from "@/generated/prisma/client";
import { getArchiveCapacity } from "@/lib/settings";
import { getDaysOfGrace, toUtcDateKey } from "@/lib/timezone";

export async function getPublicStats() {
  const [totalTestimonies, lockedCount, uniquePeople] = await Promise.all([
    prisma.testimony.count({ where: { status: TestimonyStatus.approved } }),
    prisma.lockedArchive.count(),
    prisma.testimony.groupBy({
      by: ["ipHash"],
      where: { status: TestimonyStatus.approved, ipHash: { not: null } },
    }),
  ]);

  return {
    totalTestimonies,
    lockedCount,
    uniquePeople: uniquePeople.length,
    daysOfGrace: getDaysOfGrace(),
  };
}

export async function getArchiveStats() {
  const [claimed, capacity] = await Promise.all([
    prisma.lockedArchive.count(),
    getArchiveCapacity(),
  ]);

  return {
    claimed,
    capacity,
    remaining: Math.max(0, capacity - claimed),
    isFull: claimed >= capacity,
  };
}

export async function getYearCalendarCounts() {
  const start = new Date(Date.UTC(2026, 0, 1));
  const end = new Date(Date.UTC(2026, 11, 31));

  const rows = await prisma.$queryRaw<
    Array<{ day: Date; total: bigint; locked: bigint }>
  >`
    SELECT
      t."occurredOn" AS day,
      COUNT(*)::bigint AS total,
      COUNT(*) FILTER (WHERE t."isLocked" = true)::bigint AS locked
    FROM "Testimony" t
    WHERE t.status = 'approved'
      AND t."occurredOn" >= ${start}
      AND t."occurredOn" <= ${end}
    GROUP BY t."occurredOn"
    ORDER BY t."occurredOn"
  `;

  const map = new Map<string, { total: number; locked: number }>();
  for (const row of rows) {
    const key = toUtcDateKey(row.day);
    map.set(key, {
      total: Number(row.total),
      locked: Number(row.locked),
    });
  }
  return map;
}

export async function getCalendarCounts(month: number) {
  const start = new Date(Date.UTC(2026, month - 1, 1));
  const end = new Date(Date.UTC(2026, month, 0));

  const rows = await prisma.$queryRaw<
    Array<{ day: Date; total: bigint; locked: bigint }>
  >`
    SELECT
      t."occurredOn" AS day,
      COUNT(*)::bigint AS total,
      COUNT(*) FILTER (WHERE t."isLocked" = true)::bigint AS locked
    FROM "Testimony" t
    WHERE t.status = 'approved'
      AND t."occurredOn" >= ${start}
      AND t."occurredOn" <= ${end}
    GROUP BY t."occurredOn"
    ORDER BY t."occurredOn"
  `;

  const map = new Map<string, { total: number; locked: number }>();
  for (const row of rows) {
    const key = toUtcDateKey(row.day);
    map.set(key, {
      total: Number(row.total),
      locked: Number(row.locked),
    });
  }
  return map;
}

export async function getYearEndStats() {
  const [totalTestimonies, lockedCount, categoryBreakdown] = await Promise.all([
    prisma.testimony.count({ where: { status: TestimonyStatus.approved } }),
    prisma.lockedArchive.count(),
    prisma.testimony.groupBy({
      by: ["categoryId"],
      where: { status: TestimonyStatus.approved },
      _count: true,
    }),
  ]);

  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return {
    totalTestimonies,
    lockedCount,
    categories: categoryBreakdown
      .map((row) => ({
        category: categoryMap.get(row.categoryId),
        count: row._count,
      }))
      .filter((row) => row.category)
      .sort((a, b) => b.count - a.count),
  };
}
