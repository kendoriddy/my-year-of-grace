import type { OgTheme } from "@/lib/og-themes";

type OgCardProps = {
  theme: OgTheme;
  dateLabel: string;
  quote: string;
  footerLabel: string;
  urlLabel: string;
};

export function OgCard({
  theme,
  dateLabel,
  quote,
  footerLabel,
  urlLabel,
}: OgCardProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: theme.background,
        color: theme.text,
        padding: "64px",
        fontFamily: "serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: theme.accent,
          }}
        >
          My Year of Grace
        </div>
        <div style={{ fontSize: 24, marginTop: 16, color: theme.muted }}>
          {dateLabel}
        </div>
      </div>
      <div style={{ fontSize: 42, lineHeight: 1.3, maxWidth: "900px" }}>
        “{quote}”
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 24,
          alignItems: "flex-end",
        }}
      >
        <div style={{ color: theme.muted }}>2026</div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: theme.text }}>{footerLabel}</div>
          <div style={{ fontSize: 20, marginTop: 8, color: theme.muted }}>
            {urlLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
