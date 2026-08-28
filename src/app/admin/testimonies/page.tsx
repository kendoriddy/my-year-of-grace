import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TestimonyStatus } from "@/generated/prisma/client";
import { formatLagosDate } from "@/lib/timezone";
import { truncate } from "@/lib/utils";

export const metadata = {
  robots: { index: false, follow: false },
};

async function updateStatusAction(formData: FormData) {
  "use server";
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as TestimonyStatus;
  await prisma.testimony.update({
    where: { id },
    data: { status },
  });
  redirect("/admin/testimonies");
}

export default async function AdminTestimoniesPage({
  searchParams,
}: PageProps<"/admin/testimonies">) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const params = await searchParams;
  const status =
    typeof params.status === "string"
      ? (params.status as TestimonyStatus)
      : undefined;
  const q = typeof params.q === "string" ? params.q : undefined;

  const testimonies = await prisma.testimony.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { content: { contains: q, mode: "insensitive" } },
              { displayName: { contains: q, mode: "insensitive" } },
              { publicId: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Testimonies</h1>
      <form method="get" className="mt-6 flex flex-wrap gap-3">
        <Input name="q" placeholder="Search" defaultValue={q} />
        <select
          name="status"
          defaultValue={status}
          className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm"
        >
          <option value="">All statuses</option>
          {Object.values(TestimonyStatus).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <Button type="submit">Filter</Button>
      </form>

      <div className="mt-8 space-y-4">
        {testimonies.map((testimony) => (
          <Card key={testimony.id}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  {testimony.status} · {formatLagosDate(testimony.occurredOn)}
                </p>
                <p className="mt-2 font-medium text-ink">
                  {testimony.category.emoji} {truncate(testimony.content, 160)}
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  {testimony.displayName || "Anonymous"} ·{" "}
                  <Link href={`/t/${testimony.publicId}`} className="underline">
                    /t/{testimony.publicId}
                  </Link>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["approved", "flagged", "hidden", "rejected"] as const).map(
                  (nextStatus) => (
                    <form key={nextStatus} action={updateStatusAction}>
                      <input type="hidden" name="id" value={testimony.id} />
                      <input type="hidden" name="status" value={nextStatus} />
                      <Button type="submit" size="sm" variant="secondary">
                        {nextStatus}
                      </Button>
                    </form>
                  ),
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
