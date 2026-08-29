import { prisma } from "@/lib/db";
import {
  PROFANITY_LIST,
  SYSTEM_RESERVED_SLUGS,
} from "@/lib/constants";
import { slugify } from "@/lib/utils";

const SLUG_HOLD_MS = 30 * 60 * 1000;

export function validateSlugFormat(slug: string): string | null {
  if (slug.length < 3 || slug.length > 40) {
    return "Use 3–40 characters.";
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return "Use lowercase letters, numbers, and hyphens only.";
  }
  if (slug.startsWith("-") || slug.endsWith("-")) {
    return "The link cannot start or end with a hyphen.";
  }
  if (slug.includes("--")) {
    return "The link cannot contain consecutive hyphens.";
  }
  return null;
}

export function containsProfanitySlug(slug: string): boolean {
  return PROFANITY_LIST.some((word) => slug.includes(word));
}

export async function isSlugReserved(slug: string): Promise<boolean> {
  if ((SYSTEM_RESERVED_SLUGS as readonly string[]).includes(slug)) {
    return true;
  }

  const reserved = await prisma.reservedSlug.findUnique({ where: { slug } });
  return Boolean(reserved);
}

export async function isSlugAvailable(
  slug: string,
  options?: { ignoreTestimonyId?: string },
): Promise<boolean> {
  const formatError = validateSlugFormat(slug);
  if (formatError) return false;
  if (containsProfanitySlug(slug)) return false;
  if (await isSlugReserved(slug)) return false;

  const existing = await prisma.lockedArchive.findUnique({
    where: { customSlug: slug },
  });
  if (existing) return false;

  const hold = await prisma.slugHold.findUnique({ where: { slug } });
  if (hold && hold.expiresAt > new Date()) {
    if (!options?.ignoreTestimonyId || hold.testimonyId !== options.ignoreTestimonyId) {
      return false;
    }
  }

  return true;
}

export async function suggestSlugs(baseName: string): Promise<string[]> {
  const base = slugify(baseName) || "grace";
  const candidates = [
    base,
    `${base}-2026`,
    `${base}-grace`,
    `${base}-testimony`,
    `${base}-${Math.floor(Math.random() * 90 + 10)}`,
  ];

  const suggestions: string[] = [];
  for (const candidate of candidates) {
    const normalized = slugify(candidate);
    if (normalized && (await isSlugAvailable(normalized))) {
      suggestions.push(normalized);
    }
    if (suggestions.length >= 3) break;
  }
  return suggestions;
}

export async function holdSlug(slug: string, testimonyId: string) {
  await prisma.slugHold.deleteMany({
    where: {
      OR: [{ testimonyId }, { expiresAt: { lt: new Date() } }],
    },
  });

  await prisma.slugHold.upsert({
    where: { slug },
    create: {
      slug,
      testimonyId,
      expiresAt: new Date(Date.now() + SLUG_HOLD_MS),
    },
    update: {
      testimonyId,
      expiresAt: new Date(Date.now() + SLUG_HOLD_MS),
    },
  });
}

export async function releaseSlugHolds(testimonyId: string) {
  await prisma.slugHold.deleteMany({ where: { testimonyId } });
}
