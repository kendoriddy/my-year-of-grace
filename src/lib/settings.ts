import { prisma } from "@/lib/db";
import { DEFAULT_SETTINGS } from "@/lib/constants";

export async function getSetting(key: string): Promise<string> {
  const setting = await prisma.setting.findUnique({ where: { key } });
  if (setting) return setting.value;
  return DEFAULT_SETTINGS[key] ?? "";
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: keys } },
  });
  const map: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}

export async function getLockPriceKobo(): Promise<number> {
  const value = await getSetting("lockPriceKobo");
  return Number(value) || 50000;
}

export async function getArchiveCapacity(): Promise<number> {
  const value = await getSetting("archiveCapacity");
  return Number(value) || 10000;
}

export async function setSetting(key: string, value: string) {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}
