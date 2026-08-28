import { NextResponse } from "next/server";
import { finalizeLockFromPayment } from "@/lib/lock";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      event?: string;
      data?: { reference?: string };
    };

    if (body.event === "charge.success" && body.data?.reference) {
      await finalizeLockFromPayment(body.data.reference);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
