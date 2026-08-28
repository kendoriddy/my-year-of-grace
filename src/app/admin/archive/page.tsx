import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatGraceNumber, truncate } from "@/lib/utils";
import { formatLagosDate } from "@/lib/timezone";

export const metadata = {
  robots: { index: false, follow: false },
};

async function updateSlugAction(formData: FormData) {
  "use server";
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const id = String(formData.get("id") || "");
  const customSlug = String(formData.get("customSlug") || "").toLowerCase();
  const slugDisabled = formData.get("slugDisabled") === "on";

  await prisma.lockedArchive.update({
    where: { id },
    data: { customSlug, slugDisabled },
  });
  redirect("/admin/archive");
}

export default async function AdminArchivePage({
  searchParams,
}: PageProps<"/admin/archive">) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const q = typeof (await searchParams).q === "string" ? String((await searchParams).q) : "";

  const entries = await prisma.lockedArchive.findMany({
    where: q
      ? {
          OR: [
            { customSlug: { contains: q, mode: "insensitive" } },
            { testimony: { content: { contains: q, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: {
      testimony: { include: { category: true } },
      payment: true,
    },
    orderBy: { archiveNumber: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Locked Archive</h1>
      <form className="mt-6 flex gap-3">
        <Input name="q" placeholder="Search archive" defaultValue={q} />
        <Button type="submit">Search</Button>
      </form>

      <div className="mt-8 space-y-4">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
              <div>
                <p className="text-sm text-ember">{formatGraceNumber(entry.archiveNumber)}</p>
                <p className="mt-2 text-ink">{truncate(entry.testimony.content, 180)}</p>
                <p className="mt-2 text-sm text-zinc-500">
                  {formatLagosDate(entry.testimony.occurredOn)} · {entry.payment.status}
                </p>
                <Link href={`/${entry.customSlug}`} className="mt-2 inline-block text-sm underline">
                  /{entry.customSlug}
                </Link>
              </div>
              <form action={updateSlugAction} className="space-y-3 lg:w-80">
                <input type="hidden" name="id" value={entry.id} />
                <Input name="customSlug" defaultValue={entry.customSlug} />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="slugDisabled"
                    defaultChecked={entry.slugDisabled}
                  />
                  Disable slug
                </label>
                <Button type="submit" size="sm">
                  Save
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
