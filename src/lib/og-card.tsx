import type { OgTheme } from "@/lib/og-themes";

type OgCardProps = {
  theme: OgTheme;
  dateLabel: string;
  quote: string;
  footerLabel: string;
  urlLabel: string;
  author?: string;
  ratio?: "og" | "story" | "square";
  photoSrc?: string | null;
};

export function OgCard({
  theme,
  dateLabel,
  quote,
  footerLabel,
  urlLabel,
  author,
  ratio = "og",
  photoSrc,
}: OgCardProps) {
  const isStory = ratio === "story";
  const padding = isStory ? 72 : 64;
  const brandSize = isStory ? 22 : 28;
  const quoteSize = isStory ? 46 : ratio === "square" ? 40 : 42;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(180deg, ${theme.background} 0%, ${theme.backgroundAlt} 100%)`,
        color: theme.text,
        fontFamily: "Georgia, serif",
      }}
    >
      {photoSrc ? (
        <img
          src={photoSrc}
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            opacity: 0.32,
          }}
        />
      ) : null}
      {photoSrc ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            background: `linear-gradient(180deg, ${theme.background} 0%, ${theme.backgroundAlt} 100%)`,
            opacity: 0.58,
          }}
        />
      ) : null}
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: brandSize,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: theme.accent,
            }}
          >
            My Year of Grace
          </div>
          <div
            style={{
              display: "flex",
              fontSize: isStory ? 22 : 24,
              marginTop: 16,
              color: theme.muted,
            }}
          >
            {dateLabel}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: quoteSize,
              lineHeight: 1.35,
              maxWidth: isStory ? 920 : 900,
            }}
          >
            {`“${quote}”`}
          </div>
          {author ? (
            <div
              style={{
                display: "flex",
                fontSize: 24,
                marginTop: 28,
                color: theme.muted,
              }}
            >
              {`— ${author}`}
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", color: theme.muted }}>2026</div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <div style={{ display: "flex", color: theme.accent }}>
              {footerLabel}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 20,
                marginTop: 8,
                color: theme.muted,
              }}
            >
              {urlLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
