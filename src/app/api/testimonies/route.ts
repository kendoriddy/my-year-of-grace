import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { MANAGE_COOKIE } from "@/lib/constants";
import { createTestimony, testimonySchema } from "@/lib/testimonies";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = testimonySchema.parse(body);
    const { testimony, manageToken, publicId } = await createTestimony(parsed);

    const cookieStore = await cookies();
    const existing = cookieStore.get(MANAGE_COOKIE)?.value;
    const tokens = existing ? (JSON.parse(existing) as Record<string, string>) : {};
    tokens[publicId] = manageToken;
    cookieStore.set(MANAGE_COOKIE, JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return NextResponse.json({
      publicId: testimony.publicId,
      status: testimony.status,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create testimony.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
