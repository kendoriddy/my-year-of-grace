import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { MANAGE_COOKIE } from "@/lib/constants";
import { hashValue, verifyManageToken } from "@/lib/crypto";
import { getEnv } from "@/lib/env";

const ADMIN_COOKIE = "yog_admin_session";

export type ManageTokenMap = Record<string, string>;

export async function getManageTokensFromCookies(): Promise<ManageTokenMap> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(MANAGE_COOKIE)?.value;
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ManageTokenMap;
  } catch {
    return {};
  }
}

export async function canManageTestimony(
  publicId: string,
  manageToken?: string | null,
): Promise<boolean> {
  if (!manageToken) {
    const tokens = await getManageTokensFromCookies();
    manageToken = tokens[publicId];
  }
  if (!manageToken) return false;

  const testimony = await prisma.testimony.findUnique({
    where: { publicId },
    select: { manageTokenHash: true },
  });
  if (!testimony) return false;
  return verifyManageToken(manageToken, testimony.manageTokenHash);
}

export async function createAdminSession(email: string): Promise<string> {
  const token = crypto.randomUUID();
  const tokenHash = hashValue(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.adminSession.create({
    data: { tokenHash, email, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (token) {
    await prisma.adminSession.deleteMany({
      where: { tokenHash: hashValue(token) },
    });
  }
  cookieStore.delete(ADMIN_COOKIE);
}

export async function getAdminSession(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.adminSession.findFirst({
    where: {
      tokenHash: hashValue(token),
      expiresAt: { gt: new Date() },
    },
  });

  if (!session) return null;
  return { email: session.email };
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const env = getEnv();
  return email === env.ADMIN_EMAIL && password === env.ADMIN_PASSWORD;
}
