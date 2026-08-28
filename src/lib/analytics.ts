"use client";

import posthog from "posthog-js";

let initialized = false;

export function initAnalytics() {
  if (typeof window === "undefined" || initialized) return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: true,
  });
  initialized = true;
}

export function trackEvent(
  event: string,
  properties?: Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined") return;
  initAnalytics();
  posthog.capture(event, properties);
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  if (typeof window !== "undefined") {
    initAnalytics();
  }
  return children;
}
