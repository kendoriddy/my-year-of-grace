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
      return NextResponse.json({ error: "Already locked." }, { status: 400 });
    }

    const payment = await createPendingLockPayment(testimony.id, body.email);
    const initialized = await initializePaystackPayment({
      email: body.email || testimony.email || undefined,
      amount: payment.amount,
      reference: payment.reference,
      metadata: {
        testimonyId: testimony.id,
        testimonyPublicId: testimony.publicId,
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
