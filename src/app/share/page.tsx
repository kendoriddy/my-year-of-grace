import { Suspense } from "react";
import { ShareForm } from "@/components/share-form";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Share Your Testimony",
  description: "Tell us what God has done for you in 2026.",
};

export default async function SharePage({
  searchParams,
}: PageProps<"/share">) {
  const params = await searchParams;
  const defaultDate =
    typeof params.date === "string" ? params.date : undefined;

  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-8 text-center">
        <p className="text-sm uppercase tracking-wide text-ink/50">Share Your Testimony</p>
        <h1 className="mt-2 font-serif text-4xl text-ink">What are you grateful for?</h1>
        <p className="mt-3 text-ink/70">
          It&apos;s free. Your story becomes part of the 2026 calendar of grace.
        </p>
      </div>
      <Suspense fallback={<div>Loading form...</div>}>
        <ShareForm categories={categories} defaultDate={defaultDate} />
      </Suspense>
    </div>
  );
}
