import {
  Gift,
  Hash,
  ImageIcon,
  Link2,
  Lock,
  Palette,
  Sparkle,
  Sparkles,
} from "lucide-react";

type PreserveBenefitsProps = {
  slug?: string;
  themeLabel?: string;
  graceNumber?: string;
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

export function PreserveValueGrid({
  slug,
  themeLabel,
  graceNumber,
}: Readonly<PreserveBenefitsProps>) {
  const items = [
    {
      icon: Lock,
      title: "Preserved forever",
      body: "Your testimony becomes part of the 2026 Grace Archive.",
    },
    {
      icon: Link2,
      title: "Your own link",
      body: `myyearofgrace.com/${slug || "your-link"}`,
    },
    {
      icon: Palette,
      title: "Your design",
      body: themeLabel
        ? `Keep the ${themeLabel} style you just chose.`
        : "Keep the style you just chose.",
    },
    {
      icon: Sparkles,
      title: "Your animated page",
      body: "The preview becomes your permanent page.",
    },
    {
      icon: ImageIcon,
      title: "Your Grace Card",
      body: "Download and share it.",
    },
    {
      icon: Hash,
      title: "Your Grace number",
      body: graceNumber || "Assigned the moment you preserve it.",
    },
    {
      icon: Gift,
      title: "December 31",
      body: "A special digital gift awaits you.",
    },
  ];

  return (
    <div className="mx-auto mt-10 grid gap-3 text-left sm:grid-cols-2">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.title}
            className="rounded-2xl border border-ink/10 bg-paper/70 px-4 py-4"
          >
            <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-ember">
              <Icon className="size-3.5" strokeWidth={1.7} aria-hidden />
              {item.title}
            </p>
            <p className="mt-2 text-sm text-ink/75">{item.body}</p>
          </div>
        );
      })}
    </div>
  );
}
