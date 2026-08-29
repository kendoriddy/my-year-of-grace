import { NextRequest, NextResponse } from "next/server";
import { attachManageTokenCookie } from "@/lib/auth";
import { MANAGE_COOKIE } from "@/lib/constants";
import { verifyManageToken } from "@/lib/crypto";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const submitted = request.nextUrl.searchParams.get("submitted") === "1";

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

  if (!matched) {
    return new NextResponse("Not found", { status: 404 });
  }

  let destination = `/preserve/${matched.publicId}${submitted ? "?submitted=1" : ""}`;
  if (matched.isLocked && matched.lockedArchive) {
    destination = `/${matched.lockedArchive.customSlug}`;
  }

  const response = NextResponse.redirect(new URL(destination, request.url));
  attachManageTokenCookie(
    response,
    request.cookies.get(MANAGE_COOKIE)?.value,
    matched.publicId,
    token,
  );
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
