import { APP_URL } from "@/lib/env";

type InitializePayload = {
  email?: string;
  amount: number;
  reference: string;
  metadata: Record<string, string>;
  callbackUrl: string;
};

export async function initializePaystackPayment(payload: InitializePayload) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new Error("Paystack is not configured.");
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email || "guest@myyearofgrace.com",
      amount: payload.amount,
      reference: payload.reference,
      currency: "NGN",
      callback_url: payload.callbackUrl,
      metadata: {
        custom_fields: Object.entries(payload.metadata).map(([key, value]) => ({
          display_name: key,
          variable_name: key,
          value,
        })),
        ...payload.metadata,
      },
    }),
  });

  const data = (await response.json()) as {
    status?: boolean;
    message?: string;
    data?: { authorization_url?: string; reference?: string };
  };

  if (!response.ok || !data.status || !data.data?.authorization_url) {
    throw new Error(data.message || "Unable to initialize payment.");
  }

  return data.data;
}

export async function verifyPaystackPayment(reference: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new Error("Paystack is not configured.");
  }

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: { Authorization: `Bearer ${secret}` },
    },
  );

  const data = (await response.json()) as {
    status?: boolean;
    data?: {
      status?: string;
      amount?: number;
      currency?: string;
      reference?: string;
      metadata?: Record<string, string>;
    };
  };

  if (!response.ok || !data.status || !data.data) {
    throw new Error("Payment verification failed.");
  }

  return data.data;
}

export function buildPaystackReference(testimonyId: string) {
  return `yog_${testimonyId.slice(-8)}_${Date.now()}`;
}

export function buildLockCallbackUrl(publicId: string) {
  return `${APP_URL}/preserve/${publicId}/success`;
}
