import { NextResponse } from "next/server";
import { suggestSlugs, validateSlugFormat, isSlugAvailable } from "@/lib/slugs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = (searchParams.get("slug") || "").toLowerCase().trim();
  const name = searchParams.get("name") || "";
  const publicId = searchParams.get("publicId") || "";
  let ignoreTestimonyId = searchParams.get("testimonyId") || undefined;

  if (!ignoreTestimonyId && publicId) {
    const { prisma } = await import("@/lib/db");
    const testimony = await prisma.testimony.findUnique({
      where: { publicId },
      select: { id: true },
    });
    ignoreTestimonyId = testimony?.id;
  }

  if (!slug) {
    return NextResponse.json({ error: "Missing slug." }, { status: 400 });
  }

  const formatError = validateSlugFormat(slug);
  if (formatError) {
    return NextResponse.json({
      available: false,
      error: formatError,
      suggestions: await suggestSlugs(name || slug),
    });
  }

  const available = await isSlugAvailable(slug, { ignoreTestimonyId });
  if (available) {
    return NextResponse.json({ available: true, slug });
  }

  return NextResponse.json({
    available: false,
    error: `${slug} is already taken.`,
    suggestions: await suggestSlugs(name || slug),
  });
}
