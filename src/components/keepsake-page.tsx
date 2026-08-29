"use client";

import Link from "next/link";
import { getPalette, type PaletteId } from "@/lib/palettes";
import { formatLagosDate } from "@/lib/timezone";
import { formatGraceNumber, previewGraceNumber } from "@/lib/utils";

export type KeepsakeData = {
  content: string;
  occurredOn: string | Date;
  author: string;
  location?: string | null;
  imageUrl?: string | null;
  archiveNumber?: number | null;
  customSlug: string;
  paletteId: PaletteId | string;
};

type KeepsakePageProps = {
  testimony: KeepsakeData;
  preview?: boolean;
  showAcquisition?: boolean;
};

const PARTICLES = [
  { top: "12%", left: "18%", delay: "0s", size: 4 },
  { top: "22%", left: "78%", delay: "1.4s", size: 3 },
  { top: "38%", left: "10%", delay: "2.2s", size: 5 },
  { top: "48%", left: "88%", delay: "0.8s", size: 3 },
  { top: "64%", left: "16%", delay: "3s", size: 4 },
  { top: "72%", left: "72%", delay: "1.8s", size: 3 },
  { top: "84%", left: "42%", delay: "2.6s", size: 4 },
  { top: "18%", left: "48%", delay: "3.4s", size: 2 },
  { top: "8%", left: "62%", delay: "4.1s", size: 2 },
  { top: "55%", left: "6%", delay: "2.9s", size: 3 },
  { top: "91%", left: "70%", delay: "1.1s", size: 2 },
  { top: "33%", left: "92%", delay: "3.8s", size: 4 },
];

export function KeepsakePage({
  testimony,
  preview = false,
  showAcquisition = true,
}: KeepsakePageProps) {
  const palette = getPalette(testimony.paletteId);
  const dateLabel = formatLagosDate(testimony.occurredOn);
  const slug = testimony.customSlug || "your-link";
  const graceLabel = testimony.archiveNumber
    ? formatGraceNumber(testimony.archiveNumber)
    : preview
      ? formatGraceNumber(
          previewGraceNumber(testimony.customSlug || testimony.content),
        )
      : "GRACE # assigned after preservation";

  return (
    <section
      className="keepsake"
      style={
        {
          "--k-bg": palette.background,
          "--k-bg-alt": palette.backgroundAlt,
          "--k-text": palette.text,
          "--k-muted": palette.muted,
          "--k-accent": palette.accent,
          "--k-glow": palette.glow,
          "--k-particle": palette.particle,
        } as React.CSSProperties
      }
    >
      <div className="keepsake-glow" />
      <div className="keepsake-glow keepsake-glow-alt" />
      <div className="keepsake-grain" />
      {PARTICLES.map((particle, index) => (
        <span
          key={index}
          className="keepsake-particle"
          style={{
            top: particle.top,
            left: particle.left,
            width: particle.size,
            height: particle.size,
            animationDelay: particle.delay,
          }}
        />
      ))}

      <div
        className={`relative z-10 mx-auto flex max-w-3xl flex-col justify-center px-6 py-20 text-center ${preview ? "min-h-[720px]" : "min-h-[100dvh]"}`}
      >
        {preview && (
          <p className="keepsake-reveal mb-8 text-[11px] uppercase tracking-[0.28em] text-[color:var(--k-muted)]">
            Preview of your public page
          </p>
        )}

        <p className="keepsake-reveal text-[11px] uppercase tracking-[0.32em] text-[color:var(--k-accent)]">
          My Year of Grace
        </p>
        <p
          className="keepsake-reveal mt-3 font-serif text-6xl text-[color:var(--k-text)] md:text-7xl"
          style={{ animationDelay: "0.12s" }}
        >
          2026
        </p>
        <p
          className="keepsake-reveal mt-6 text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--k-accent)]"
          style={{ animationDelay: "0.22s" }}
        >
          {graceLabel}
        </p>
        <p
          className="keepsake-reveal mt-8 text-sm text-[color:var(--k-muted)]"
          style={{ animationDelay: "0.32s" }}
        >
          {dateLabel}
        </p>

        {testimony.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={testimony.imageUrl}
            alt=""
            className="keepsake-reveal mx-auto mt-10 h-40 w-40 rounded-full object-cover shadow-lg"
            style={{ animationDelay: "0.4s" }}
          />
        )}

        <blockquote
          className="keepsake-reveal mt-10 font-serif text-3xl leading-snug text-[color:var(--k-text)] md:text-5xl md:leading-snug"
          style={{ animationDelay: "0.45s" }}
        >
          “{testimony.content}”
        </blockquote>

        <p
          className="keepsake-reveal mt-8 text-lg text-[color:var(--k-muted)]"
          style={{ animationDelay: "0.62s" }}
        >
          — {testimony.author}
          {testimony.location ? `, ${testimony.location}` : ""}
        </p>

        <div
          className="keepsake-reveal mx-auto mt-12 max-w-md border-t border-[color:var(--k-accent)]/25 pt-8"
          style={{ animationDelay: "0.78s" }}
        >
          <div className="keepsake-ornament" aria-hidden />
          <p className="font-serif text-xl text-[color:var(--k-text)] md:text-2xl">
            This moment mattered to me.
          </p>
          <p className="mt-2 text-sm text-[color:var(--k-muted)]">
            That&apos;s why I preserved it.
          </p>
          <p className="mt-6 text-xs tracking-wide text-[color:var(--k-muted)]">
            myyearofgrace.com/{slug}
          </p>
        </div>

        {showAcquisition && !preview && (
          <div
            className="keepsake-reveal mt-16 rounded-3xl border border-[color:var(--k-accent)]/20 bg-[color:var(--k-bg)]/40 px-6 py-8 backdrop-blur-sm"
            style={{ animationDelay: "0.95s" }}
          >
            <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--k-accent)]">
              My Year of Grace
            </p>
            <p className="mt-3 font-serif text-2xl text-[color:var(--k-text)]">
              Before the year ends, tell us what God has done.
            </p>
            <Link
              href="/share"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[color:var(--k-accent)] px-6 text-sm font-medium text-white"
            >
              Tell Your Own Story
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
