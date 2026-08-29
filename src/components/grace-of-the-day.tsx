import Link from "next/link";
import { formatLagosDate } from "@/lib/timezone";
import { getGraceOfTheDay } from "@/lib/testimonies";
import { truncate } from "@/lib/utils";

export async function GraceOfTheDay() {
  const testimony = await getGraceOfTheDay();
  if (!testimony) return null;

  const author = testimony.isAnonymous
    ? "Anonymous"
    : testimony.displayName || "Anonymous";
  const href = testimony.lockedArchive
    ? `/${testimony.lockedArchive.customSlug}`
    : `/t/${testimony.publicId}`;

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-ink/10 bg-white/70 px-6 py-10 text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-ember">
          Grace of the Day
        </p>
        <p className="mt-3 text-sm text-ink/50">
          {formatLagosDate(testimony.occurredOn)}
        </p>
        <p className="mt-6 font-serif text-3xl leading-snug text-ink">
          “{truncate(testimony.content, 180)}”
        </p>
        <p className="mt-4 text-ink/65">
          — {author}
          {testimony.location ? `, ${testimony.location}` : ""}
        </p>
        <Link href={href} className="mt-6 inline-block text-sm text-ember hover:underline">
          Read testimony →
        </Link>
      </div>
    </section>
  );
}
