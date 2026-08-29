import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { MANAGE_COOKIE } from "@/lib/constants";
import { verifyManageToken } from "@/lib/crypto";
import { prisma } from "@/lib/db";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function ManagePage({
  params,
  searchParams,
}: PageProps<"/manage/[token]">) {
  const { token } = await params;
  const query = await searchParams;

  const candidates = await prisma.testimony.findMany({
    where: { status: "approved" },
    select: {
      publicId: true,
      manageTokenHash: true,
      isLocked: true,
      lockedArchive: { select: { customSlug: true } },
    },
  });

  let matched: (typeof candidates)[number] | undefined;
  for (const item of candidates) {
    if (await verifyManageToken(token, item.manageTokenHash)) {
      matched = item;
      break;
    }
  }

  if (!matched) notFound();

  const cookieStore = await cookies();
  const existing = cookieStore.get(MANAGE_COOKIE)?.value;
  const tokens = existing
    ? (JSON.parse(existing) as Record<string, string>)
    : {};
  tokens[matched.publicId] = token;
  cookieStore.set(MANAGE_COOKIE, JSON.stringify(tokens), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  if (matched.isLocked && matched.lockedArchive) {
    redirect(`/${matched.lockedArchive.customSlug}`);
  }

  redirect(
    `/preserve/${matched.publicId}${query.submitted === "1" ? "?submitted=1" : ""}`,
  );
}
