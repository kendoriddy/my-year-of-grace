"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNaira } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

type LockCheckoutProps = {
  publicId: string;
  priceKobo: number;
  remaining: number;
  capacity: number;
  email?: string | null;
};

export function LockCheckout({
  publicId,
  priceKobo,
  remaining,
  capacity,
  email,
}: LockCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startPayment() {
    setLoading(true);
    setError(null);
    trackEvent("lock_cta_click", { publicId });
    trackEvent("payment_initiated", { publicId });

    try {
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId, email }),
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-ember/20 bg-ember/5 p-6">
      <p className="text-sm uppercase tracking-wide text-ember">Preserve Your Testimony</p>
      <h2 className="mt-2 font-serif text-2xl text-ink">
        Your testimony deserves its own place on the internet.
      </h2>
      <p className="mt-3 text-sm text-ink/70">
        {remaining.toLocaleString()} / {capacity.toLocaleString()} preserved places remaining.
      </p>
      <p className="mt-4 text-3xl font-semibold text-ink">{formatNaira(priceKobo)}</p>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <Button
        variant="ember"
        className="mt-6"
        onClick={startPayment}
        disabled={loading || remaining <= 0}
      >
        {remaining <= 0
          ? "Archive Full"
          : loading
            ? "Redirecting..."
            : `Preserve my testimony — ${formatNaira(priceKobo)}`}
      </Button>
    </div>
  );
}

type SlugPickerProps = {
  publicId: string;
  suggestions: string[];
};

export function SlugPicker({ publicId, suggestions }: SlugPickerProps) {
  const [slug, setSlug] = useState(suggestions[0] || "");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function saveSlug(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/lock/slug", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId, slug }),
    });
    const data = (await response.json()) as { error?: string; slug?: string };

    if (!response.ok) {
      setMessage(data.error || "Unable to save URL.");
    } else {
      setMessage(`Your permanent page: myyearofgrace.com/${data.slug}`);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={saveSlug} className="mt-8 space-y-4 rounded-2xl border border-ink/10 p-6">
      <Label htmlFor="slug">Choose your custom URL</Label>
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="flex flex-1 items-center rounded-xl border border-ink/10 bg-white px-4">
          <span className="text-sm text-ink/50">myyearofgrace.com/</span>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            className="border-0 px-2 shadow-none focus:ring-0"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save URL"}
        </Button>
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSlug(item)}
              className="rounded-full border border-ink/10 px-3 py-1 text-xs"
            >
              {item}
            </button>
          ))}
        </div>
      )}
      {message && <p className="text-sm text-ink/70">{message}</p>}
    </form>
  );
}
