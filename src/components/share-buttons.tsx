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
  prominent?: boolean;
};

export function ShareButtons({
  publicId,
  content,
  customUrl,
  locked = false,
  prominent = false,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const pageUrl = customUrl
    ? `${APP_URL}/${customUrl}`
    : `${APP_URL}/t/${publicId}`;
  const whatsappText = locked
    ? `🙏 I just preserved my 2026 testimony with My Year of Grace.\n\n${pageUrl}\n\nBefore the year ends, what has God done for you?\nTell your story:\n${APP_URL}`
    : `"${content.slice(0, 120)}..." — My Year of Grace 2026\n${pageUrl}`;
  const tweetText = locked
    ? `I preserved my 2026 testimony with My Year of Grace.`
    : `"${content.slice(0, 120)}..." — My Year of Grace 2026`;

  async function recordShare(
    platform: "whatsapp" | "facebook" | "x" | "copy" | "download" | "instagram",
  ) {
    trackEvent("share_click", { platform, publicId, locked });
    await fetch("/api/shares", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId, platform }),
    });
  }

  return (
    <div className={prominent ? "grid gap-3 sm:grid-cols-2" : "flex flex-wrap gap-3"}>
      <Button asChild variant="ember" className={prominent ? "sm:col-span-2" : undefined}>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => recordShare("whatsapp")}
        >
          Share to WhatsApp
        </a>
      </Button>
      <Button asChild variant="secondary">
        <a
          href={`/api/og/${publicId}?ratio=story&download=1`}
          onClick={() => recordShare("instagram")}
        >
          Share to Instagram
        </a>
      </Button>
      <Button asChild variant="secondary">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(pageUrl)}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => recordShare("x")}
        >
          Share to X
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
