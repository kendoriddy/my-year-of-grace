import { redirect } from "next/navigation";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function LockSuccessRedirect({
  params,
  searchParams,
}: PageProps<"/lock/[publicId]/success">) {
  const { publicId } = await params;
  const query = await searchParams;
  const reference =
    typeof query.reference === "string" ? `?reference=${query.reference}` : "";
  redirect(`/preserve/${publicId}/success${reference}`);
}
