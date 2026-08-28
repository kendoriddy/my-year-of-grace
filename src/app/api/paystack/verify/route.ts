import { NextResponse } from "next/server";
import { finalizeLockFromPayment } from "@/lib/lock";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { reference?: string };
    if (!body.reference) {
      return NextResponse.json({ error: "Missing reference." }, { status: 400 });
    }

    const locked = await finalizeLockFromPayment(body.reference);
    return NextResponse.json({ locked });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Verification failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ error: "Missing reference." }, { status: 400 });
  }

  try {
    const locked = await finalizeLockFromPayment(reference);
    return NextResponse.json({ locked });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Verification failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
