import { NextResponse } from "next/server";
import { assignCustomSlug } from "@/lib/lock";
import { canManageTestimony } from "@/lib/auth";
import { validateSlugFormat } from "@/lib/slugs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      publicId?: string;
      slug?: string;
    };

    if (!body.publicId || !body.slug) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const formatError = validateSlugFormat(body.slug);
    if (formatError) {
      return NextResponse.json({ error: formatError }, { status: 400 });
    }

    if (!(await canManageTestimony(body.publicId))) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const testimony = await import("@/lib/testimonies").then((m) =>
      m.getApprovedTestimony(body.publicId!),
    );
    if (!testimony?.isLocked) {
      return NextResponse.json({ error: "Testimony is not preserved." }, { status: 400 });
    }

    const tokens = await import("@/lib/auth").then((m) =>
      m.getManageTokensFromCookies(),
    );
    const manageToken = tokens[body.publicId];
    if (!manageToken) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const updated = await assignCustomSlug(
      testimony.id,
      body.slug,
      manageToken,
    );

    return NextResponse.json({ slug: updated.customSlug });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save slug.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
