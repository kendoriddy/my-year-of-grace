import { prisma } from "@/lib/db";
import { PaymentStatus } from "@/generated/prisma/client";
import { verifyPaystackPayment } from "@/lib/paystack";
import { getArchiveCapacity } from "@/lib/settings";
import { getPalette } from "@/lib/palettes";
import { isSlugAvailable, releaseSlugHolds } from "@/lib/slugs";

export async function finalizeLockFromPayment(reference: string) {
  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: { testimony: true },
  });

  if (!payment) {
    throw new Error("Payment not found.");
  }

  if (payment.status === PaymentStatus.success && payment.testimony.isLocked) {
    return prisma.lockedArchive.findUnique({
      where: { testimonyId: payment.testimonyId },
    });
  }

  const verified = await verifyPaystackPayment(reference);
  if (verified.status !== "success") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.failed },
    });
    throw new Error("Payment was not successful.");
  }

  if (
    verified.amount !== payment.amount ||
    verified.currency !== payment.currency
  ) {
    throw new Error("Payment amount mismatch.");
  }

  return prisma.$transaction(async (tx) => {
    const claimed = await tx.lockedArchive.count();
    const capacity = await getArchiveCapacity();

    if (claimed >= capacity) {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.failed },
      });
      throw new Error("The 2026 Grace Archive is now full.");
    }

    if (payment.testimony.isLocked) {
      return tx.lockedArchive.findUnique({
        where: { testimonyId: payment.testimonyId },
      });
    }

    const last = await tx.lockedArchive.findFirst({
      orderBy: { archiveNumber: "desc" },
      select: { archiveNumber: true },
    });
    const archiveNumber = (last?.archiveNumber ?? 0) + 1;
    const fallbackSlug = `grace-${String(archiveNumber).padStart(6, "0")}`;

    const metadata = (payment.metadata ?? {}) as {
      preferredSlug?: string;
      themeId?: string;
    };
    const preferredSlug =
      payment.testimony.preferredSlug || metadata.preferredSlug || "";
    const themeId = getPalette(
      payment.testimony.themeId || metadata.themeId,
    ).id;

    let customSlug = fallbackSlug;
    if (
      preferredSlug &&
      (await isSlugAvailable(preferredSlug, {
        ignoreTestimonyId: payment.testimonyId,
      }))
    ) {
      customSlug = preferredSlug;
    }

    await tx.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.success },
    });

    await tx.testimony.update({
      where: { id: payment.testimonyId },
      data: { isLocked: true, themeId },
    });

    const locked = await tx.lockedArchive.create({
      data: {
        testimonyId: payment.testimonyId,
        archiveNumber,
        customSlug,
        paymentId: payment.id,
        themeId,
        giftEligible: true,
      },
    });

    if (payment.email) {
      const { sendLockConfirmationEmail } = await import("@/lib/email");
      await sendLockConfirmationEmail({
        email: payment.email,
        archiveNumber: locked.archiveNumber,
        customSlug: locked.customSlug,
        amountKobo: payment.amount,
      }).catch(() => undefined);
    }

    return locked;
  }).then(async (locked) => {
    await releaseSlugHolds(payment.testimonyId).catch(() => undefined);
    return locked;
  });
}

export async function assignCustomSlug(
  testimonyId: string,
  slug: string,
  manageToken: string,
) {
  const testimony = await prisma.testimony.findUnique({
    where: { id: testimonyId },
    include: { lockedArchive: true },
  });

  if (!testimony?.lockedArchive) {
    throw new Error("Testimony is not preserved yet.");
  }

  const { isSlugAvailable: check } = await import("@/lib/slugs");
  if (!(await check(slug))) {
    throw new Error("That URL is not available.");
  }

  const { canManageTestimony } = await import("@/lib/auth");
  if (!(await canManageTestimony(testimony.publicId, manageToken))) {
    throw new Error("Unauthorized.");
  }

  return prisma.lockedArchive.update({
    where: { testimonyId },
    data: { customSlug: slug },
  });
}

export async function savePreservationIntent(params: {
  testimonyId: string;
  preferredSlug: string;
  themeId: string;
}) {
  const themeId = getPalette(params.themeId).id;
  const available = await isSlugAvailable(params.preferredSlug, {
    ignoreTestimonyId: params.testimonyId,
  });
  if (!available) {
    throw new Error("That URL is not available.");
  }

  const { holdSlug } = await import("@/lib/slugs");
  await holdSlug(params.preferredSlug, params.testimonyId);

  return prisma.testimony.update({
    where: { id: params.testimonyId },
    data: {
      preferredSlug: params.preferredSlug,
      themeId,
    },
  });
}

export async function createPendingLockPayment(
  testimonyId: string,
  email?: string | null,
) {
  const [testimony, amount, capacityStats] = await Promise.all([
    prisma.testimony.findUnique({ where: { id: testimonyId } }),
    import("@/lib/settings").then((m) => m.getLockPriceKobo()),
    import("@/lib/stats").then((m) => m.getArchiveStats()),
  ]);

  if (!testimony) throw new Error("Testimony not found.");
  if (testimony.isLocked) throw new Error("Already preserved.");
  if (capacityStats.isFull) throw new Error("The 2026 Grace Archive is now full.");

  const { buildPaystackReference } = await import("@/lib/paystack");
  const reference = buildPaystackReference(testimonyId);

  return prisma.payment.create({
    data: {
      testimonyId,
      reference,
      amount,
      email: email || testimony.email,
      status: PaymentStatus.pending,
      metadata: {
        testimonyPublicId: testimony.publicId,
        preferredSlug: testimony.preferredSlug,
        themeId: testimony.themeId,
      },
    },
  });
}
