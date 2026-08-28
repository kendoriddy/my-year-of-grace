import { prisma } from "@/lib/db";
import {
  PROFANITY_LIST,
  SYSTEM_RESERVED_SLUGS,
} from "@/lib/constants";
import { slugify } from "@/lib/utils";

export function validateSlugFormat(slug: string): string | null {
  if (slug.length < 3 || slug.length > 40) {
    return "Slug must be 3–40 characters.";
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return "Use lowercase letters, numbers, and hyphens only.";
  }
  if (slug.startsWith("-") || slug.endsWith("-")) {
    return "Slug cannot start or end with a hyphen.";
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

export async function isSlugAvailable(slug: string): Promise<boolean> {
  const formatError = validateSlugFormat(slug);
  if (formatError) return false;
  if (containsProfanitySlug(slug)) return false;
  if (await isSlugReserved(slug)) return false;

  const existing = await prisma.lockedArchive.findUnique({
    where: { customSlug: slug },
  });
  return !existing;
}

export async function suggestSlugs(baseName: string): Promise<string[]> {
  const base = slugify(baseName) || "grace";
  const candidates = [
    base,
    `${base}-2026`,
    `${base}-grace`,
    `${base}-${Math.floor(Math.random() * 90 + 10)}`,
  ];

  const suggestions: string[] = [];
  for (const candidate of candidates) {
    if (await isSlugAvailable(candidate)) {
      suggestions.push(candidate);
    }
    if (suggestions.length >= 3) break;
  }
  return suggestions;
}
