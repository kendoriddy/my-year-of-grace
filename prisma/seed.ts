import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_SETTINGS,
  SYSTEM_RESERVED_SLUGS,
} from "../src/lib/constants";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const [index, category] of DEFAULT_CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: {
        name: category.name,
        emoji: category.emoji,
        slug: category.slug,
        sortOrder: index,
        active: true,
      },
      update: {
        name: category.name,
        emoji: category.emoji,
        sortOrder: index,
        active: true,
      },
    });
  }

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: {},
    });
  }

  for (const slug of SYSTEM_RESERVED_SLUGS) {
    await prisma.reservedSlug.upsert({
      where: { slug },
      create: { slug, reason: "system" },
      update: {},
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
