import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { createAdminSession, getAdminSession, verifyAdminCredentials } from "@/lib/auth";

export const metadata = {
  robots: { index: false, follow: false },
};

async function loginAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (!verifyAdminCredentials(email, password)) {
    redirect("/admin/login?error=1");
  }

  await createAdminSession(email);
  redirect("/admin");
}

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  const params = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16">
      <Card className="w-full">
        <h1 className="font-serif text-3xl text-ink">Admin Login</h1>
        <form action={loginAction} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {params.error === "1" && (
            <p className="text-sm text-red-600">Invalid credentials.</p>
          )}
          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-ink/50">
          <Link href="/">Back to site</Link>
        </p>
      </Card>
    </div>
  );
}
