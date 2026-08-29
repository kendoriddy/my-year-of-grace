export type OgThemeId = "sand" | "terracotta" | "midnight" | "sage" | "ember";

export type OgTheme = {
  id: OgThemeId;
  label: string;
  background: string;
  text: string;
  muted: string;
  accent: string;
};

export const OG_THEMES: Record<OgThemeId, OgTheme> = {
  sand: {
    id: "sand",
    label: "Sand",
    background: "#F7F1E8",
    text: "#1E1A16",
    muted: "rgba(30, 26, 22, 0.7)",
    accent: "#9A6B2F",
  },
  terracotta: {
    id: "terracotta",
    label: "Terracotta",
    background: "#B56A45",
    text: "#F7F1E8",
    muted: "rgba(247, 241, 232, 0.82)",
    accent: "#F7F1E8",
  },
  midnight: {
    id: "midnight",
    label: "Midnight",
    background: "#1E1A16",
    text: "#F7F1E8",
    muted: "rgba(247, 241, 232, 0.72)",
    accent: "#B56A45",
  },
  sage: {
    id: "sage",
    label: "Sage",
    background: "#E8EDE6",
    text: "#1E1A16",
    muted: "rgba(30, 26, 22, 0.65)",
    accent: "#5A6B5A",
  },
  ember: {
    id: "ember",
    label: "Ember",
    background: "#9A6B2F",
    text: "#F7F1E8",
    muted: "rgba(247, 241, 232, 0.82)",
    accent: "#F7F1E8",
  },
};

export const DEFAULT_OG_THEME: OgThemeId = "sand";

export function getOgTheme(themeId: string | null | undefined): OgTheme {
  if (themeId && themeId in OG_THEMES) {
    return OG_THEMES[themeId as OgThemeId];
  }
  return OG_THEMES[DEFAULT_OG_THEME];
}

export const OG_THEME_IDS = Object.keys(OG_THEMES) as OgThemeId[];
