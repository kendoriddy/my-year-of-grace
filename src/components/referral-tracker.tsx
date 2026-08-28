"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref") || searchParams.get("utm_source");
    if (ref) {
      trackEvent("referral_visit", { ref });
    }
  }, [searchParams]);

  return null;
}
