"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { KeepsakePage } from "@/components/keepsake-page";
import { PreserveValueGrid } from "@/components/preserve-benefits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { PALETTES, PALETTE_IDS, type PaletteId } from "@/lib/palettes";
import {
  formatGraceNumber,
  formatNaira,
  previewGraceNumber,
  slugify,
} from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

type PreserveExperienceProps = {
  publicId: string;
  content: string;
  occurredOn: string;
  author: string;
  location?: string | null;
  imageUrl?: string | null;
  email?: string | null;
  initialSlug?: string;
  initialThemeId?: string;
  priceKobo: number;
  remaining: number;
  capacity: number;
  submitted?: boolean;
};

export function PreserveExperience({
  publicId,
  content,
  occurredOn,
  author,
  location,
  imageUrl,
  email: initialEmail,
  initialSlug,
  initialThemeId,
  priceKobo,
  remaining,
  capacity,
  submitted = false,
}: PreserveExperienceProps) {
  const [slug, setSlug] = useState(
    initialSlug || slugify(author) || "my-grace",
  );
  const [themeId, setThemeId] = useState<PaletteId>(
    (initialThemeId as PaletteId) || "midnight",
  );
  const [email, setEmail] = useState(initialEmail || "");
  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [slugError, setSlugError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const archiveFull = remaining <= 0;

  const checkSlug = useCallback(
    async (value: string) => {
      const normalized = value.toLowerCase().trim();
      if (normalized.length < 3) {
        setSlugStatus("taken");
        setSlugError("Use 3–40 characters.");
        return false;
      }

      setSlugStatus("checking");
      const response = await fetch(
        `/api/slugs/check?slug=${encodeURIComponent(normalized)}&name=${encodeURIComponent(author)}&publicId=${encodeURIComponent(publicId)}`,
      );
      const data = (await response.json()) as {
        available?: boolean;
        error?: string;
        suggestions?: string[];
      };

      if (data.available) {
        setSlugStatus("available");
        setSlugError(null);
        setSuggestions([]);
        return true;
      }

      setSlugStatus("taken");
      setSlugError(data.error || "That URL is not available.");
      setSuggestions(data.suggestions || []);
      return false;
    },
    [author, publicId],
  );

  useEffect(() => {
    const handle = setTimeout(() => {
      void checkSlug(slug);
    }, 350);
    return () => clearTimeout(handle);
  }, [slug, checkSlug]);

  async function persistIntent(nextSlug = slug, nextTheme = themeId) {
    await fetch("/api/preserve/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId, slug: nextSlug, themeId: nextTheme }),
    });
  }

  useEffect(() => {
    if (slugStatus !== "available") return;
    const handle = setTimeout(() => {
      void persistIntent();
    }, 600);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugStatus, slug, themeId, publicId]);

  const previewNumber = useMemo(() => previewGraceNumber(publicId), [publicId]);

  const keepsake = useMemo(
    () => ({
      content,
      occurredOn,
      author,
      location,
      imageUrl,
      customSlug: slug,
      paletteId: themeId,
      archiveNumber: previewNumber,
    }),
    [
      content,
      occurredOn,
      author,
      location,
      imageUrl,
      slug,
      themeId,
      previewNumber,
    ],
  );

  async function startPayment() {
    if (archiveFull) return;
    setError(null);
    trackEvent("preserve_cta_click", { publicId });

    const available = await checkSlug(slug);
    if (!available) {
      setError("Please choose an available link before preserving.");
      return;
    }

    setPaying(true);
    trackEvent("payment_initiated", { publicId });

    try {
      await persistIntent();
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicId,
          email,
          slug,
          themeId,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        authorizationUrl?: string;
      };
      if (!response.ok || !data.authorizationUrl) {
        throw new Error(data.error || "Unable to start payment.");
      }
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed to start.");
      trackEvent("payment_failed", { publicId });
      setPaying(false);
    }
  }

  return (
    <div>
      {submitted && (
        <div className="bg-ember/10 px-4 py-3 text-center text-sm text-ember">
          Your testimony is live. Now give it a place of its own.
        </div>
      )}

      <section className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-ember">
          Your preservation studio
        </p>
        <h1 className="mt-4 font-serif text-4xl text-ink md:text-5xl">
          Create your place on the internet
        </h1>
        <p className="mt-4 text-ink/65">
          Choose your link and style, then see the exact page you&apos;ll keep.
        </p>
      </section>

      <section className="mx-auto max-w-3xl space-y-8 px-4 pb-10">
        <div className="rounded-3xl border border-ink/10 bg-white/80 p-5 md:p-6">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-ember">
            1 · Choose your link
          </p>
          <Label htmlFor="slug" className="mt-3 block">
            Claim your custom link
          </Label>
          <p className="mt-1 text-sm text-ink/55">
            Claim your custom link before someone else does.
          </p>
          <div className="mt-3 flex items-center rounded-xl border border-ink/10 bg-white px-4">
            <span className="shrink-0 text-sm text-ink/45">
              myyearofgrace.com/
            </span>
            <Input
              id="slug"
              value={slug}
              onChange={(event) =>
                setSlug(
                  event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                )
              }
              className="border-0 px-2 shadow-none focus:ring-0"
              maxLength={40}
            />
          </div>
          <p className="mt-2 text-sm">
            {slugStatus === "checking" && (
              <span className="text-ink/50">Checking availability…</span>
            )}
            {slugStatus === "available" && (
              <span className="inline-flex items-center gap-1.5 text-emerald-800">
                <Check className="size-4" strokeWidth={2.2} aria-hidden />
                Available
              </span>
            )}
            {slugStatus === "taken" && (
              <span className="text-red-700">{slugError}</span>
            )}
          </p>
          {slugStatus === "available" && slug && (
            <div className="mt-4 rounded-2xl border border-ember/15 bg-ember/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-ember">
                This will be your personal link
              </p>
              <p className="mt-1 font-serif text-xl text-ink md:text-2xl">
                myyearofgrace.com/{slug}
              </p>
            </div>
          )}
          {suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSlug(item)}
                  className="rounded-full border border-ink/10 px-3 py-1 text-xs hover:border-ink/30"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-ember">
            2 · Choose your style
          </p>
          <p className="mt-3 text-sm font-medium text-ink/80">
            Pick a visual theme. The page below will change with it.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {PALETTE_IDS.map((id) => {
              const palette = PALETTES[id];
              const selected = themeId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setThemeId(id);
                    trackEvent("palette_selected", { publicId, themeId: id });
                  }}
                  className={`rounded-2xl border p-3 text-left transition ${
                    selected
                      ? "border-ink ring-2 ring-ink/15"
                      : "border-ink/10 hover:border-ink/25"
                  }`}
                  style={{ background: palette.background }}
                >
                  <span
                    className="mb-3 block h-8 rounded-lg"
                    style={{ background: palette.accent }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: palette.text }}
                  >
                    {palette.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-3 pb-6 md:px-8">
        <div className="mx-auto max-w-3xl pb-5 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-ember">
            3 · See your page
          </p>
          <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
            Here&apos;s what your preserved page will look like.
          </h2>
          <p className="mt-2 text-sm text-ink/55">
            This is the real page — not a mockup.
          </p>
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-ink/10">
          <KeepsakePage
            key={`${themeId}-${slug}`}
            testimony={keepsake}
            preview
            showAcquisition={false}
          />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-[2rem] border border-ember/20 bg-white p-6 text-center shadow-sm md:p-10">
          <p className="text-xs uppercase tracking-[0.24em] text-ember">
            You just created something worth keeping.
          </p>
          <h2 className="mt-4 font-serif text-3xl text-ink md:text-4xl">
            Your testimony deserves its own place on the internet.
          </h2>
          <p className="mt-4 text-lg text-ink/70">
            Give it a permanent home for {formatNaira(priceKobo)}.
          </p>

          <PreserveValueGrid
            slug={slug}
            themeLabel={PALETTES[themeId].label}
            graceNumber={formatGraceNumber(previewNumber)}
          />

          <p className="mt-10 text-sm text-ink/60">
            Only {capacity.toLocaleString()} testimonies can be preserved in the
            2026 Grace Archive.
          </p>
          <p className="mt-1 text-sm font-medium text-ember">
            {remaining.toLocaleString()} places remaining.
          </p>

          {!initialEmail && (
            <div className="mx-auto mt-6 max-w-sm text-left">
              <Label htmlFor="email">Email for your receipt and page</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2"
                placeholder="you@email.com"
              />
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

          <Button
            variant="ember"
            size="lg"
            className="mt-8 w-full md:w-auto"
            onClick={startPayment}
            disabled={paying || archiveFull || slugStatus !== "available"}
          >
            {archiveFull
              ? "The 2026 Grace Archive is now full"
              : paying
                ? "Redirecting to Paystack..."
                : `Preserve my testimony — ${formatNaira(priceKobo)}`}
          </Button>

          <p className="mt-4">
            <a
              href={`/t/${publicId}`}
              className="text-sm text-ink/50 hover:text-ink"
            >
              Maybe later
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
