"use client";

import { useEffect, useRef, useState } from "react";
import { HandHeart } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { MAX_CLAPS_PER_VISITOR } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ClapButtonProps = {
  publicId: string;
  initialCount?: number;
  className?: string;
  /** Softer styling for keepsake / themed pages */
  muted?: boolean;
};

type ClapResponse = {
  ok?: boolean;
  clapCount?: number;
  yourClaps?: number;
  remaining?: number;
  error?: string;
};

export function ClapButton({
  publicId,
  initialCount = 0,
  className,
  muted = false,
}: ClapButtonProps) {
  const [clapCount, setClapCount] = useState(initialCount);
  const [yourClaps, setYourClaps] = useState(0);
  const [remaining, setRemaining] = useState(MAX_CLAPS_PER_VISITOR);
  const [burst, setBurst] = useState<number | null>(null);
  const [pressing, setPressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const burstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadStats() {
      try {
        const res = await fetch(
          `/api/claps?publicId=${encodeURIComponent(publicId)}`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as ClapResponse;
        if (cancelled) return;
        if (typeof data.clapCount === "number") setClapCount(data.clapCount);
        if (typeof data.yourClaps === "number") setYourClaps(data.yourClaps);
        if (typeof data.remaining === "number") setRemaining(data.remaining);
      } catch {
        // Non-blocking: page still works with server-rendered count
      }
    }
    void loadStats();
    return () => {
      cancelled = true;
      if (burstTimer.current) clearTimeout(burstTimer.current);
    };
  }, [publicId]);

  async function clap() {
    if (pending || remaining <= 0) return;
    setPending(true);
    setError(null);
    setPressing(true);
    setTimeout(() => setPressing(false), 180);

    const nextYour = yourClaps + 1;
    setClapCount((c) => c + 1);
    setYourClaps(nextYour);
    setRemaining((r) => Math.max(0, r - 1));
    setBurst(nextYour);
    if (burstTimer.current) clearTimeout(burstTimer.current);
    burstTimer.current = setTimeout(() => setBurst(null), 700);

    trackEvent("clap", { publicId, yourClaps: nextYour });

    try {
      const res = await fetch("/api/claps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });
      const data = (await res.json()) as ClapResponse;
      if (!res.ok) {
        setClapCount((c) => Math.max(0, c - 1));
        setYourClaps((y) => Math.max(0, y - 1));
        setRemaining((r) => r + 1);
        setBurst(null);
        setError(data.error || "Could not clap right now.");
        return;
      }
      if (typeof data.clapCount === "number") setClapCount(data.clapCount);
      if (typeof data.yourClaps === "number") setYourClaps(data.yourClaps);
      if (typeof data.remaining === "number") setRemaining(data.remaining);
    } catch {
      setClapCount((c) => Math.max(0, c - 1));
      setYourClaps((y) => Math.max(0, y - 1));
      setRemaining((r) => r + 1);
      setBurst(null);
      setError("Could not clap right now.");
    } finally {
      setPending(false);
    }
  }

  const hasClapped = yourClaps > 0;
  const label =
    clapCount === 0
      ? "Be the first to clap"
      : clapCount === 1
        ? "1 clap"
        : `${clapCount.toLocaleString()} claps`;

  return (
    <div
      className={cn("relative inline-flex flex-col items-start gap-1", className)}
    >
      <button
        type="button"
        onClick={() => void clap()}
        disabled={remaining <= 0}
        aria-label={`Clap for this testimony. ${label}`}
        className={cn(
          "group relative inline-flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/40",
          muted
            ? "border-[color:var(--k-accent)]/30 bg-[color:var(--k-bg)]/50 text-[color:var(--k-text)] hover:border-[color:var(--k-accent)]/60"
            : hasClapped
              ? "border-terracotta/35 bg-terracotta/10 text-terracotta hover:bg-terracotta/15"
              : "border-ink/15 bg-paper text-ink hover:border-terracotta/40 hover:bg-terracotta/5",
          pressing && "scale-[0.97]",
        )}
      >
        <span
          className={cn(
            "relative flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-200",
            muted
              ? "bg-[color:var(--k-accent)]/15 text-[color:var(--k-accent)]"
              : "bg-terracotta/15 text-terracotta",
            pressing && "clap-press",
            hasClapped && "clap-glow",
          )}
        >
          <HandHeart
            className={cn(
              "h-5 w-5 transition-transform duration-200",
              pressing && "scale-110 -rotate-6",
            )}
            strokeWidth={1.75}
          />
          {burst !== null && (
            <span
              key={burst}
              className="clap-burst pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-terracotta"
              aria-hidden
            >
              +{burst}
            </span>
          )}
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="font-medium">
            {hasClapped ? "Clap again" : "Clap"}
          </span>
          <span
            className={cn(
              "text-xs",
              muted ? "text-[color:var(--k-muted)]" : "text-ink/55",
            )}
          >
            {label}
            {yourClaps > 0 ? ` · yours ${yourClaps}` : ""}
          </span>
        </span>
      </button>
      {error && (
        <p className="text-xs text-terracotta" role="status">
          {error}
        </p>
      )}
    </div>
  );
}
