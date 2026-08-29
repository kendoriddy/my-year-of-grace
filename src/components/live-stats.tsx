import { getPublicStats } from "@/lib/stats";

export async function LiveStats() {
  const stats = await getPublicStats();

  const items = [
    {
      label: "testimonies shared",
      value: stats.totalTestimonies.toLocaleString(),
    },
    {
      label: "testimonies preserved",
      value: stats.lockedCount.toLocaleString(),
    },
    {
      label: "days of 2026 documented",
      value: stats.daysOfGrace.toLocaleString(),
    },
    {
      label: "people have shared their stories",
      value: stats.uniquePeople.toLocaleString(),
    },
  ];

  return (
    <section className="border-y border-ink/8 bg-white/50 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="text-center md:text-left">
            <p className="font-serif text-4xl font-bold text-ink md:text-5xl">
              {item.value}
            </p>
            <p className="mt-2 text-sm font-medium uppercase tracking-wide text-ink/60">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
