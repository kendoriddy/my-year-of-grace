import type { MetadataRoute } from "next";
import { CANONICAL_DOMAIN } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/manage", "/lock", "/preserve", "/api"],
      },
    ],
    sitemap: `https://${CANONICAL_DOMAIN}/sitemap.xml`,
  };
}
