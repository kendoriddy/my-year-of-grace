"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DEFAULT_OG_THEME, OG_THEMES, type OgThemeId } from "@/lib/og-themes";
import { trackEvent } from "@/lib/analytics";

type ShareCardProps = {
  publicId: string;
  locked?: boolean;
};

export function ShareCard({ publicId, locked = false }: ShareCardProps) {
  const [themeId, setThemeId] = useState<OgThemeId>(DEFAULT_OG_THEME);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const previewUrl = useMemo(
    () => `/api/og/${publicId}?theme=${themeId}`,
    [publicId, themeId],
  );

  async function recordDownload() {
    trackEvent("share_click", { platform: "download", publicId, locked });
    await fetch("/api/shares", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId, platform: "download" }),
    });
  }

  async function handleDownload() {
    setDownloading(true);
    setError(null);

    try {
      const response = await fetch(`${previewUrl}&download=1`);
      if (!response.ok) {
        throw new Error("Could not generate your share card.");
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error("The share card came back empty. Please try again.");
      }

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `my-year-of-grace-${publicId}-${themeId}.png`;
      link.click();
      URL.revokeObjectURL(objectUrl);
      await recordDownload();
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Download failed. Please try again.",
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-ink/10 bg-paper p-4 md:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-ink/50">
            Share card
          </p>
          <p className="mt-1 text-sm text-ink/70">
            Preview your card, pick a color, then download it for WhatsApp or
            Instagram.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={loading || downloading}
          onClick={handleDownload}
        >
          {downloading ? "Preparing..." : "Download PNG"}
        </Button>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-ink/10 bg-ink/5">
        {loading && (
          <div className="flex aspect-[1200/630] items-center justify-center text-sm text-ink/50">
            Generating preview...
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={previewUrl}
          src={previewUrl}
          alt="Share card preview"
          className={`w-full ${loading ? "hidden" : "block"}`}
          onLoad={() => {
            setLoading(false);
            setError(null);
          }}
          onError={() => {
            setLoading(false);
            setError("Could not load the share card preview.");
          }}
        />
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
          Card color
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.values(OG_THEMES).map((theme) => {
            const selected = theme.id === themeId;
            return (
              <button
                key={theme.id}
                type="button"
                aria-pressed={selected}
                aria-label={`${theme.label} theme`}
                onClick={() => {
                  setThemeId(theme.id);
                  setLoading(true);
                  setError(null);
                }}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                  selected
                    ? "border-ink bg-ink text-paper"
                    : "border-ink/15 bg-paper text-ink hover:border-ink/30"
                }`}
              >
                <span
                  className="h-4 w-4 rounded-full border border-ink/10"
                  style={{ backgroundColor: theme.background }}
                />
                {theme.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
