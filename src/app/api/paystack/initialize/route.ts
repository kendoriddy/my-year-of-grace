import { NextResponse } from "next/server";
import {
  buildLockCallbackUrl,
  initializePaystackPayment,
} from "@/lib/paystack";
import { canManageTestimony } from "@/lib/auth";
import { createPendingLockPayment } from "@/lib/lock";
import { getApprovedTestimony } from "@/lib/testimonies";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      publicId?: string;
      email?: string;
      slug?: string;
      themeId?: string;
    };

    if (!body.publicId) {
      return NextResponse.json({ error: "Missing testimony." }, { status: 400 });
    }

    const testimony = await getApprovedTestimony(body.publicId);
    if (!testimony) {
      return NextResponse.json({ error: "Testimony not found." }, { status: 404 });
    }

    if (!(await canManageTestimony(body.publicId))) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    if (testimony.isLocked) {
      return NextResponse.json({ error: "Already preserved." }, { status: 400 });
    }

    const email = body.email || testimony.email;
    if (!email) {
      return NextResponse.json(
        { error: "An email is needed so we can keep your preserved page safe." },
        { status: 400 },
      );
    }

    if (body.slug || body.themeId) {
      const { savePreservationIntent } = await import("@/lib/lock");
      await savePreservationIntent({
        testimonyId: testimony.id,
        preferredSlug: (body.slug || testimony.preferredSlug || "").toLowerCase(),
        themeId: body.themeId || testimony.themeId,
      }).catch(() => undefined);
    }

    const payment = await createPendingLockPayment(testimony.id, email);
    const initialized = await initializePaystackPayment({
      email,
      amount: payment.amount,
      reference: payment.reference,
      metadata: {
        testimonyId: testimony.id,
        testimonyPublicId: testimony.publicId,
        preferredSlug: body.slug || testimony.preferredSlug || "",
        themeId: body.themeId || testimony.themeId,
      },
      callbackUrl: buildLockCallbackUrl(testimony.publicId),
    });

    return NextResponse.json({
      authorizationUrl: initialized.authorization_url,
      reference: payment.reference,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to initialize payment.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
