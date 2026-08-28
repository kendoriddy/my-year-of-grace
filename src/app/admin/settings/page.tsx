import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAdminSession } from "@/lib/auth";
import { getSettings, setSetting } from "@/lib/settings";
import { prisma } from "@/lib/db";

export const metadata = {
  robots: { index: false, follow: false },
};

async function saveSettingsAction(formData: FormData) {
  "use server";
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const keys = [
    "lockPriceKobo",
    "archiveCapacity",
    "homepageHeroSubtitle",
    "homepageAnnouncement",
    "giftTeaser",
    "maxPhotoSizeMb",
  ];

  for (const key of keys) {
    const value = String(formData.get(key) || "");
    if (value) await setSetting(key, value);
  }

  redirect("/admin/settings?saved=1");
}

async function banIdentityAction(formData: FormData) {
  "use server";
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const email = String(formData.get("banEmail") || "");
  const ipHash = String(formData.get("banIpHash") || "");
  const reason = String(formData.get("banReason") || "admin ban");

  await prisma.blockedIdentity.create({
    data: {
      email: email || null,
      ipHash: ipHash || null,
      reason,
    },
  });

  redirect("/admin/settings?banned=1");
}

export default async function AdminSettingsPage({
  searchParams,
}: PageProps<"/admin/settings">) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const settings = await getSettings([
    "lockPriceKobo",
    "archiveCapacity",
    "homepageHeroSubtitle",
    "homepageAnnouncement",
    "giftTeaser",
    "maxPhotoSizeMb",
  ]);

  const params = await searchParams;

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-3xl text-ink">Settings</h1>
      {params.saved === "1" && (
        <p className="mt-2 text-sm text-green-700">Settings saved.</p>
      )}
      {params.banned === "1" && (
        <p className="mt-2 text-sm text-green-700">Identity blocked.</p>
      )}

      <Card className="mt-8">
        <form action={saveSettingsAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lockPriceKobo">Lock price (kobo)</Label>
            <Input id="lockPriceKobo" name="lockPriceKobo" defaultValue={settings.lockPriceKobo} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="archiveCapacity">Archive capacity</Label>
            <Input
              id="archiveCapacity"
              name="archiveCapacity"
              defaultValue={settings.archiveCapacity}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="homepageAnnouncement">Homepage announcement</Label>
            <Input
              id="homepageAnnouncement"
              name="homepageAnnouncement"
              defaultValue={settings.homepageAnnouncement}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="homepageHeroSubtitle">Homepage subtitle</Label>
            <Textarea
              id="homepageHeroSubtitle"
              name="homepageHeroSubtitle"
              defaultValue={settings.homepageHeroSubtitle}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="giftTeaser">Gift teaser copy</Label>
            <Textarea id="giftTeaser" name="giftTeaser" defaultValue={settings.giftTeaser} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxPhotoSizeMb">Max photo size (MB)</Label>
            <Input
              id="maxPhotoSizeMb"
              name="maxPhotoSizeMb"
              defaultValue={settings.maxPhotoSizeMb}
            />
          </div>
          <Button type="submit">Save settings</Button>
        </form>
      </Card>

      <Card className="mt-8">
        <h2 className="font-medium text-ink">Ban user</h2>
        <form action={banIdentityAction} className="mt-4 space-y-4">
          <Input name="banEmail" placeholder="Email" />
          <Input name="banIpHash" placeholder="IP hash" />
          <Input name="banReason" placeholder="Reason" />
          <Button type="submit" variant="secondary">
            Block identity
          </Button>
        </form>
      </Card>
    </div>
  );
}
