"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { OG_THEMES, type OgThemeId } from "@/lib/og-themes";
import { trackEvent } from "@/lib/analytics";

type ShareCardProps = {
  publicId: string;
  locked?: boolean;
  themeId?: string | null;
};

export function ShareCard({
  publicId,
  locked = false,
  themeId,
}: ShareCardProps) {
  const [selectedTheme, setThemeId] = useState<OgThemeId>(
    (themeId as OgThemeId) || "midnight",
  );
  const [ratio, setRatio] = useState<"story" | "square" | "og">("og");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const previewUrl = useMemo(
    () => `/api/og/${publicId}?theme=${selectedTheme}&ratio=${ratio}`,
    [publicId, selectedTheme, ratio],
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
        throw new Error("Could not generate your Grace Card.");
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error("The Grace Card came back empty. Please try again.");
      }

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `my-year-of-grace-${publicId}-${selectedTheme}-${ratio}.png`;
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

  const frameClass =
    ratio === "story"
      ? "w-[min(100%,360px)] aspect-[9/16]"
      : ratio === "square"
        ? "w-[min(100%,480px)] aspect-square"
        : "w-full aspect-[1200/630]";

  return (
    <div className="rounded-3xl border border-ink/10 bg-paper p-4 md:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-ink/50">
            Grace Card
          </p>
          <p className="mt-1 text-sm text-ink/70">
            Download a card for WhatsApp Status or Instagram Stories.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={loading || downloading}
          onClick={handleDownload}
        >
          {downloading ? "Preparing..." : "Download Grace Card"}
        </Button>
      </div>

      <div className="mt-4 flex gap-2">
        {(["og", "square", "story"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setRatio(item);
              setLoading(true);
            }}
            className={`rounded-full px-3 py-1.5 text-xs ${
              ratio === item ? "bg-ink text-paper" : "border border-ink/15"
            }`}
          >
            {item === "story"
              ? "9:16 Story"
              : item === "square"
                ? "1:1"
                : "Landscape"}
          </button>
        ))}
      </div>

      <div
        className={`relative mx-auto mt-4 overflow-hidden rounded-2xl border border-ink/10 bg-ink/5 ${frameClass}`}
      >
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink/5 text-sm text-ink/50">
            Generating preview...
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={previewUrl}
          src={previewUrl}
          alt="Grace Card preview"
          className="h-full w-full object-contain"
          onLoad={(event) => {
            if (event.currentTarget.naturalWidth > 0) {
              setLoading(false);
              setError(null);
            } else {
              setLoading(false);
              setError("Could not load the Grace Card preview.");
            }
          }}
          onError={() => {
            setLoading(false);
            setError("Could not load the Grace Card preview.");
          }}
        />
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
          Card color
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.values(OG_THEMES).map((theme) => {
            const selected = theme.id === selectedTheme;
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
