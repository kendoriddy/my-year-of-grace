import { NextResponse } from "next/server";
import { setManageTokenCookie } from "@/lib/auth";
import { createTestimony, testimonySchema } from "@/lib/testimonies";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = testimonySchema.parse(body);
    const { testimony, manageToken, publicId } = await createTestimony(parsed);
    await setManageTokenCookie(publicId, manageToken);

    return NextResponse.json({
      publicId: testimony.publicId,
      status: testimony.status,
      manageToken,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create testimony.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
