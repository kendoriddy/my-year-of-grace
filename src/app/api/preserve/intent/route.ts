import { NextResponse } from "next/server";
import { canManageTestimony } from "@/lib/auth";
import { savePreservationIntent } from "@/lib/lock";
import { getApprovedTestimony } from "@/lib/testimonies";
import { getPalette } from "@/lib/palettes";
import { validateSlugFormat } from "@/lib/slugs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      publicId?: string;
      slug?: string;
      themeId?: string;
    };

    if (!body.publicId || !body.slug) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const slug = body.slug.toLowerCase().trim();
    const formatError = validateSlugFormat(slug);
    if (formatError) {
      return NextResponse.json({ error: formatError }, { status: 400 });
    }

    if (!(await canManageTestimony(body.publicId))) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const testimony = await getApprovedTestimony(body.publicId);
    if (!testimony) {
      return NextResponse.json({ error: "Testimony not found." }, { status: 404 });
    }
    if (testimony.isLocked) {
      return NextResponse.json({ error: "Already preserved." }, { status: 400 });
    }

    const updated = await savePreservationIntent({
      testimonyId: testimony.id,
      preferredSlug: slug,
      themeId: getPalette(body.themeId).id,
    });

    return NextResponse.json({
      slug: updated.preferredSlug,
      themeId: updated.themeId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save your preview.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
