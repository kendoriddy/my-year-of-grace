"use client";

import { useState } from "react";
import { PreserveBenefits } from "@/components/preserve-benefits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PreserveClaimProps = {
  publicId: string;
  slug?: string;
  tried?: boolean;
};

export function PreserveClaim({
  publicId,
  slug,
  tried = false,
}: Readonly<PreserveClaimProps>) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/preserve/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId, email }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Unable to continue.");
      }
      window.location.assign(`/preserve/${publicId}?try=1&n=${Date.now()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue.");
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-[2rem] border border-ember/20 bg-white p-6 text-center shadow-sm md:p-10">
        <p className="text-xs uppercase tracking-[0.24em] text-ember">
          Coming back to this testimony?
        </p>
        <h1 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
          Preserve it forever.
        </h1>
        <p className="mt-3 text-ink/65">
          If you just shared this, open it from the same browser. If you&apos;re
          on a new device, enter the email you used when you shared it.
        </p>

        <PreserveBenefits slug={slug} />

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 max-w-sm text-left"
        >
          <Label htmlFor="claim-email">Email you used to share</Label>
          <Input
            id="claim-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2"
            placeholder="you@email.com"
          />
          {tried && (
            <p className="mt-3 text-sm text-ink/60">
              If this testimony is yours, use the email you left when you shared
              it, or open this from the same browser.
            </p>
          )}
          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
          <Button
            type="submit"
            variant="ember"
            size="lg"
            className="mt-6 w-full"
            disabled={submitting}
          >
            {submitting ? "Opening..." : "Preserve it"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-ink/50">
          If you didn&apos;t leave an email, open this from the same browser you
          used to share.
        </p>
        <p className="mt-4">
          <a
            href={`/t/${publicId}`}
            className="text-sm text-ink/50 hover:text-ink"
          >
            Back to the testimony
          </a>
        </p>
      </div>
    </section>
  );
}
