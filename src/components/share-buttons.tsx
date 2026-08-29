"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { APP_URL } from "@/lib/env";
import { trackEvent } from "@/lib/analytics";

type ShareButtonsProps = {
  publicId: string;
  content: string;
  customUrl?: string;
  locked?: boolean;
};

export function ShareButtons({
  publicId,
  content,
  customUrl,
  locked = false,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const pageUrl = customUrl
    ? `${APP_URL}/${customUrl}`
    : `${APP_URL}/t/${publicId}`;
  const text = `"${content.slice(0, 120)}..." — My Year of Grace 2026`;

  async function recordShare(
    platform: "whatsapp" | "facebook" | "x" | "copy" | "download",
  ) {
    trackEvent("share_click", { platform, publicId, locked });
    await fetch("/api/shares", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId, platform }),
    });
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild variant="default">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${pageUrl}`)}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => recordShare("whatsapp")}
        >
          Share to WhatsApp
        </a>
      </Button>
      <Button asChild variant="secondary">
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => recordShare("facebook")}
        >
          Facebook
        </a>
      </Button>
      <Button asChild variant="secondary">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => recordShare("x")}
        >
          X
        </a>
      </Button>
      <Button
        variant="ghost"
        onClick={async () => {
          await navigator.clipboard.writeText(pageUrl);
          setCopied(true);
          await recordShare("copy");
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? "Copied!" : "Copy Link"}
      </Button>
    </div>
  );
}
