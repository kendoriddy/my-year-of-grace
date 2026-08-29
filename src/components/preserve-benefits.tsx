import { Sparkle } from "lucide-react";

type PreserveBenefitsProps = {
  slug?: string;
  themeLabel?: string;
};

export function PreserveBenefits({
  slug,
  themeLabel,
}: Readonly<PreserveBenefitsProps>) {
  const benefits = [
    "Permanent preservation in the 2026 Grace Archive",
    `Custom public URL — myyearofgrace.com/${slug || "your-link"}`,
    themeLabel
      ? `Your selected ${themeLabel} visual theme`
      : "A visual theme you choose",
    "An animated testimony page",
    "A unique Grace Archive number",
    "A personalized downloadable Grace Card",
    "A special digital gift on December 31",
  ];

  return (
    <ul className="mx-auto mt-8 max-w-md space-y-3 text-left text-sm text-ink/75">
      {benefits.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <Sparkle
            className="mt-0.5 size-4 shrink-0 text-ember"
            strokeWidth={1.6}
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
