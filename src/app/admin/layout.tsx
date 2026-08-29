import Link from "next/link";
import { redirect } from "next/navigation";
import { destroyAdminSession, getAdminSession } from "@/lib/auth";

async function logoutAction() {
  "use server";
  await destroyAdminSession();
  redirect("/admin/login");
}

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await getAdminSession();

  return (
    <div className="min-h-screen bg-zinc-50">
      {session ? (
        <div className="mx-auto grid min-h-screen max-w-7xl md:grid-cols-[240px_1fr]">
          <aside className="border-r border-zinc-200 bg-white p-6">
            <p className="font-serif text-xl text-ink">Admin</p>
            <p className="mt-1 text-xs text-zinc-500">{session.email}</p>
            <nav className="mt-8 space-y-2 text-sm">
              <Link href="/admin" className="block rounded-lg px-3 py-2 hover:bg-zinc-100">
                Dashboard
              </Link>
              <Link
                href="/admin/testimonies"
                className="block rounded-lg px-3 py-2 hover:bg-zinc-100"
              >
                Testimonies
              </Link>
              <Link
                href="/admin/archive"
                className="block rounded-lg px-3 py-2 hover:bg-zinc-100"
              >
                Grace Archive
              </Link>
              <Link
                href="/admin/settings"
                className="block rounded-lg px-3 py-2 hover:bg-zinc-100"
              >
                Settings
              </Link>
            </nav>
            <form action={logoutAction} className="mt-8">
              <button type="submit" className="text-sm text-zinc-500 hover:text-ink">
                Sign out
              </button>
            </form>
          </aside>
          <div className="p-6">{children}</div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
