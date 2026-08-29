import { Resend } from "resend";
import { formatGraceNumber, formatNaira } from "@/lib/utils";
import { APP_URL, CANONICAL_DOMAIN } from "@/lib/env";

export async function sendLockConfirmationEmail(params: {
  email: string;
  archiveNumber: number;
  customSlug: string;
  amountKobo: number;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: "My Year of Grace <hello@myyearofgrace.com>",
    to: params.email,
    subject: "Your testimony is preserved in the 2026 Grace Archive",
    html: `
      <p>Your testimony now has its own place on the internet.</p>
      <p><strong>${formatGraceNumber(params.archiveNumber)}</strong></p>
      <p>Your page: <a href="${APP_URL}/${params.customSlug}">${CANONICAL_DOMAIN}/${params.customSlug}</a></p>
      <p>Amount paid: ${formatNaira(params.amountKobo)}</p>
      <p>Something special is waiting for you on December 31.</p>
    `,
  });
}
