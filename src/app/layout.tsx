import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Instrument_Serif } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { ChromeVisibility } from "@/components/site-chrome";
import { Suspense } from "react";
import { PostHogProvider } from "@/components/posthog-provider";
import { ReferralTracker } from "@/components/referral-tracker";
import { CANONICAL_DOMAIN } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${CANONICAL_DOMAIN}`),
  title: {
    default: "My Year of Grace 2026",
    template: "%s | My Year of Grace",
  },
  description:
    "Before the year ends, tell us what God has done. A free digital calendar of 2026 testimonies.",
  openGraph: {
    siteName: "My Year of Grace",
    locale: "en_NG",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${instrumentSerif.variable} h-full`}>
      <body className="min-h-full bg-paper text-ink antialiased">
        <PostHogProvider>
          <Suspense fallback={null}>
            <ReferralTracker />
          </Suspense>
          <ChromeVisibility />
          <SiteNav />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </PostHogProvider>
      </body>
    </html>
  );
}
