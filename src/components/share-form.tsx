"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics";

type Category = {
  id: string;
  name: string;
  emoji: string;
};

type ShareFormProps = {
  categories: Category[];
  defaultDate?: string;
};

export function ShareForm({ categories, defaultDate }: ShareFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    trackEvent("testimony_start");

    const formData = new FormData(event.currentTarget);
    const payload = {
      content: String(formData.get("content") || ""),
      occurredOn: String(
        formData.get("occurredOn") || defaultDate || "2026-01-01",
      ),
      categoryId: String(formData.get("categoryId") || ""),
      displayName: String(formData.get("displayName") || ""),
      location: String(formData.get("location") || ""),
      email: String(formData.get("email") || ""),
      imageUrl: imageUrl || String(formData.get("imageUrl") || ""),
      isAnonymous: formData.get("visibility") === "anonymous",
      ref: searchParams.get("ref") || undefined,
    };

    try {
      const response = await fetch("/api/testimonies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        error?: string;
        publicId?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit testimony.");
      }

      trackEvent("testimony_complete", { publicId: data.publicId || "" });
      router.push(`/preserve/${data.publicId}?submitted=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="content">What are you grateful to God for?</Label>
          <Textarea
            id="content"
            name="content"
            required
            minLength={10}
            maxLength={1000}
            placeholder="Tell your story..."
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="occurredOn">What date did this happen?</Label>
            <Input
              id="occurredOn"
              name="occurredOn"
              type="date"
              required
              min="2026-01-01"
              max="2026-12-31"
              defaultValue={defaultDate || "2026-01-01"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              name="categoryId"
              required
              className="flex h-11 w-full rounded-xl border border-ink/10 bg-white px-4 text-sm"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.emoji} {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="displayName">Your name (optional)</Label>
            <Input id="displayName" name="displayName" maxLength={80} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location (optional)</Label>
            <Input
              id="location"
              name="location"
              placeholder="Lagos, Ibadan, London..."
              maxLength={80}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (optional, for confirmation)</Label>
          <Input id="email" name="email" type="email" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="photo">Photo (optional)</Label>
          <Input
            id="photo"
            type="file"
            accept="image/*"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setUploading(true);
              setError(null);
              try {
                const upload = new FormData();
                upload.set("file", file);
                const response = await fetch("/api/upload", {
                  method: "POST",
                  body: upload,
                });
                const data = (await response.json()) as {
                  url?: string;
                  error?: string;
                };
                if (!response.ok || !data.url) {
                  throw new Error(data.error || "Upload failed.");
                }
                setImageUrl(data.url);
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "Photo upload failed.",
                );
              } finally {
                setUploading(false);
              }
            }}
          />
          {uploading && <p className="text-xs text-ink/50">Uploading photo…</p>}
          {imageUrl && (
            <p className="text-xs text-emerald-800">Photo added.</p>
          )}
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-ink/80">
            Visibility
          </legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="visibility"
              value="public"
              defaultChecked
            />
            Public — show my name if provided
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="visibility" value="anonymous" />
            Anonymous — hide my name
          </label>
        </fieldset>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full md:w-auto">
          {loading ? "Submitting..." : "Share My Testimony"}
        </Button>
      </form>
    </Card>
  );
}
