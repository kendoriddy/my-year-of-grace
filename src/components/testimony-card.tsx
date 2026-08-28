import Link from "next/link";
import { formatLagosDate } from "@/lib/timezone";
import { formatGraceNumber, truncate } from "@/lib/utils";
import { Card } from "@/components/ui/card";

type TestimonyCardProps = {
  testimony: {
    publicId: string;
    content: string;
    occurredOn: Date;
    displayName: string | null;
    location: string | null;
    isAnonymous: boolean;
    category: { emoji: string; name: string };
    lockedArchive?: {
      archiveNumber: number;
      customSlug: string;
    } | null;
  };
};

export function TestimonyCard({ testimony }: TestimonyCardProps) {
  const href = testimony.lockedArchive
    ? `/${testimony.lockedArchive.customSlug}`
    : `/t/${testimony.publicId}`;

  const author = testimony.isAnonymous
    ? "Anonymous"
    : testimony.displayName || "Anonymous";

  return (
    <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={href} className="block space-y-3">
        <div className="flex items-center justify-between gap-3 text-xs text-ink/50">
          <span>{formatLagosDate(testimony.occurredOn)}</span>
          <span>
            {testimony.category.emoji} {testimony.category.name}
          </span>
        </div>
        <p className="font-serif text-lg leading-relaxed text-ink">
          “{truncate(testimony.content, 180)}”
        </p>
        <div className="flex items-center justify-between text-sm text-ink/70">
          <span>— {author}{testimony.location ? `, ${testimony.location}` : ""}</span>
          {testimony.lockedArchive && (
            <span className="text-ember">
              {formatGraceNumber(testimony.lockedArchive.archiveNumber)}
            </span>
          )}
        </div>
      </Link>
    </Card>
  );
}
