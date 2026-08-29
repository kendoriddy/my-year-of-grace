import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { TestimonyStatus } from "@/generated/prisma/client";
import { CANONICAL_DOMAIN } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [testimonies, locked] = await Promise.all([
    prisma.testimony.findMany({
      where: { status: TestimonyStatus.approved },
      select: { publicId: true, updatedAt: true },
      take: 5000,
    }),
    prisma.lockedArchive.findMany({
      where: { slugDisabled: false },
      select: { customSlug: true, lockedAt: true },
      take: 10000,
    }),
  ]);

  return [
    {
      url: `https://${CANONICAL_DOMAIN}`,
      lastModified: new Date(),
    },
    {
      url: `https://${CANONICAL_DOMAIN}/archive`,
      lastModified: new Date(),
    },
    {
      url: `https://${CANONICAL_DOMAIN}/stories`,
      lastModified: new Date(),
    },
    ...testimonies.map((item) => ({
      url: `https://${CANONICAL_DOMAIN}/t/${item.publicId}`,
      lastModified: item.updatedAt,
    })),
    ...locked.map((item) => ({
      url: `https://${CANONICAL_DOMAIN}/${item.customSlug}`,
      lastModified: item.lockedAt,
    })),
  ];
}
