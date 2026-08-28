import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getAdminSession } from "@/lib/auth";
import { getArchiveStats, getPublicStats } from "@/lib/stats";
import { prisma } from "@/lib/db";
import { PaymentStatus, TestimonyStatus } from "@/generated/prisma/client";
import { formatNaira } from "@/lib/utils";
import { getLockPriceKobo } from "@/lib/settings";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    stats,
    archiveStats,
    todayCount,
    revenueAgg,
    paymentCounts,
    shareCount,
    priceKobo,
  ] = await Promise.all([
    getPublicStats(),
    getArchiveStats(),
    prisma.testimony.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.payment.aggregate({
      where: { status: PaymentStatus.success },
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.share.count(),
    getLockPriceKobo(),
  ]);

  const successPayments =
    paymentCounts.find((p) => p.status === PaymentStatus.success)?._count ?? 0;
  const totalPayments = paymentCounts.reduce((sum, p) => sum + p._count, 0);
  const successRate =
    totalPayments > 0 ? Math.round((successPayments / totalPayments) * 100) : 0;

  const cards = [
    { label: "Total testimonies", value: stats.totalTestimonies.toLocaleString() },
    { label: "Today's submissions", value: todayCount.toLocaleString() },
    { label: "Total locked", value: archiveStats.claimed.toLocaleString() },
    {
      label: "Remaining slots",
      value: archiveStats.remaining.toLocaleString(),
    },
    {
      label: "Revenue",
      value: formatNaira(revenueAgg._sum.amount ?? 0),
    },
    { label: "Payment success rate", value: `${successRate}%` },
    { label: "Shares", value: shareCount.toLocaleString() },
    { label: "Lock price", value: formatNaira(priceKobo) },
  ];

  const flagged = await prisma.testimony.count({
    where: { status: TestimonyStatus.flagged },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Dashboard</h1>
      <p className="mt-2 text-sm text-zinc-500">
        {flagged} testimonies awaiting moderation
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <p className="text-sm text-zinc-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{card.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
