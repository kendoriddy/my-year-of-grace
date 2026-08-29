import { cookies } from "next/headers";
import { NextResponse } from "next/server";
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

export async function setManageTokenCookie(publicId: string, manageToken: string) {
  const cookieStore = await cookies();
  const tokens = await getManageTokensFromCookies();
  tokens[publicId] = manageToken;
  cookieStore.set(MANAGE_COOKIE, JSON.stringify(tokens), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

const MANAGE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

export function attachManageTokenCookie(
  response: NextResponse,
  existingValue: string | undefined,
  publicId: string,
  manageToken: string,
) {
  let tokens: ManageTokenMap = {};
  if (existingValue) {
    try {
      tokens = JSON.parse(existingValue) as ManageTokenMap;
    } catch {
      tokens = {};
    }
  }
  tokens[publicId] = manageToken;
  response.cookies.set(MANAGE_COOKIE, JSON.stringify(tokens), MANAGE_COOKIE_OPTIONS);
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
