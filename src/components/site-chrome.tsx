"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SYSTEM_RESERVED_SLUGS } from "@/lib/constants";

export function ChromeVisibility() {
  const pathname = usePathname();

  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);
    const reserved = SYSTEM_RESERVED_SLUGS as readonly string[];
    const isKeepsake = segments.length === 1 && !reserved.includes(segments[0]);
    document.body.dataset.keepsake = isKeepsake ? "true" : "";
    return () => {
      delete document.body.dataset.keepsake;
    };
  }, [pathname]);

  return null;
}
