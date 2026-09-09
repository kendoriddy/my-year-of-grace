import Link from "next/link";
import { HandHeart } from "lucide-react";
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
    clapCount?: number;
    category: { emoji: string; name: string };
    lockedArchive?: {
      archiveNumber: number;
      customSlug: string;
      themeId?: string | null;
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

  const clapCount = testimony.clapCount ?? 0;

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
        <div className="flex items-center justify-between gap-3 text-sm text-ink/70">
          <span>
            — {author}
            {testimony.location ? `, ${testimony.location}` : ""}
          </span>
          <span className="flex shrink-0 items-center gap-3">
            {clapCount > 0 && (
              <span className="inline-flex items-center gap-1 text-terracotta">
                <HandHeart className="h-3.5 w-3.5" strokeWidth={1.75} />
                {clapCount.toLocaleString()}
              </span>
            )}
            {testimony.lockedArchive && (
              <span className="text-ember">
                Preserved ·{" "}
                {formatGraceNumber(testimony.lockedArchive.archiveNumber)}
              </span>
            )}
          </span>
        </div>
      </Link>
    </Card>
  );
}
