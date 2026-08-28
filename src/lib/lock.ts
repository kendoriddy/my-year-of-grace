import { prisma } from "@/lib/db";
import { PaymentStatus } from "@/generated/prisma/client";
import { verifyPaystackPayment } from "@/lib/paystack";
import { getArchiveCapacity } from "@/lib/settings";

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
      throw new Error("The 2026 Grace Archive is full.");
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

    await tx.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.success },
    });

    await tx.testimony.update({
      where: { id: payment.testimonyId },
      data: { isLocked: true },
    });

    const locked = await tx.lockedArchive.create({
      data: {
        testimonyId: payment.testimonyId,
        archiveNumber,
        customSlug: `grace-${String(archiveNumber).padStart(6, "0")}`,
        paymentId: payment.id,
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
    throw new Error("Testimony is not locked.");
  }

  const { isSlugAvailable } = await import("@/lib/slugs");
  if (!(await isSlugAvailable(slug))) {
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
  if (testimony.isLocked) throw new Error("Already locked.");
  if (capacityStats.isFull) throw new Error("The 2026 Grace Archive is full.");

  const { buildPaystackReference } = await import("@/lib/paystack");
  const reference = buildPaystackReference(testimonyId);

  return prisma.payment.create({
    data: {
      testimonyId,
      reference,
      amount,
      email: email || testimony.email,
      status: PaymentStatus.pending,
      metadata: { testimonyPublicId: testimony.publicId },
    },
  });
}
