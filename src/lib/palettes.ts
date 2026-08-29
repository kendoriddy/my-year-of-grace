export type PaletteId =
  | "grace"
  | "sunrise"
  | "faith"
  | "hope"
  | "peace"
  | "golden"
  | "midnight"
  | "rose"
  | "emerald"
  | "ocean";

export type Palette = {
  id: PaletteId;
  label: string;
  background: string;
  backgroundAlt: string;
  text: string;
  muted: string;
  accent: string;
  glow: string;
  particle: string;
};

export const PALETTES: Record<PaletteId, Palette> = {
  grace: {
    id: "grace",
    label: "Grace",
    background: "#F7F1E8",
    backgroundAlt: "#EFE4D4",
    text: "#1E1A16",
    muted: "rgba(30, 26, 22, 0.62)",
    accent: "#B56A45",
    glow: "rgba(181, 106, 69, 0.28)",
    particle: "rgba(154, 107, 47, 0.45)",
  },
  sunrise: {
    id: "sunrise",
    label: "Sunrise",
    background: "#F6E4D4",
    backgroundAlt: "#EDC9A8",
    text: "#3A2216",
    muted: "rgba(58, 34, 22, 0.64)",
    accent: "#C45C2A",
    glow: "rgba(196, 92, 42, 0.32)",
    particle: "rgba(232, 149, 92, 0.5)",
  },
  faith: {
    id: "faith",
    label: "Faith",
    background: "#F4EFE6",
    backgroundAlt: "#E4D7C2",
    text: "#2B2118",
    muted: "rgba(43, 33, 24, 0.62)",
    accent: "#7A4E2D",
    glow: "rgba(122, 78, 45, 0.24)",
    particle: "rgba(154, 107, 47, 0.4)",
  },
  hope: {
    id: "hope",
    label: "Hope",
    background: "#F8F0DC",
    backgroundAlt: "#EED9A3",
    text: "#3A2E12",
    muted: "rgba(58, 46, 18, 0.62)",
    accent: "#C4922A",
    glow: "rgba(196, 146, 42, 0.3)",
    particle: "rgba(214, 176, 86, 0.5)",
  },
  peace: {
    id: "peace",
    label: "Peace",
    background: "#EEF2F0",
    backgroundAlt: "#D7E3DE",
    text: "#1C2A28",
    muted: "rgba(28, 42, 40, 0.62)",
    accent: "#5E7A72",
    glow: "rgba(94, 122, 114, 0.28)",
    particle: "rgba(140, 168, 160, 0.45)",
  },
  golden: {
    id: "golden",
    label: "Golden",
    background: "#F3E6C8",
    backgroundAlt: "#D9B56A",
    text: "#2F220C",
    muted: "rgba(47, 34, 12, 0.64)",
    accent: "#9A6B2F",
    glow: "rgba(154, 107, 47, 0.34)",
    particle: "rgba(212, 168, 72, 0.5)",
  },
  midnight: {
    id: "midnight",
    label: "Midnight",
    background: "#16131A",
    backgroundAlt: "#241C28",
    text: "#F4EDE0",
    muted: "rgba(244, 237, 224, 0.68)",
    accent: "#D4A574",
    glow: "rgba(212, 165, 116, 0.28)",
    particle: "rgba(244, 237, 224, 0.28)",
  },
  rose: {
    id: "rose",
    label: "Rose",
    background: "#F6E7E4",
    backgroundAlt: "#E8C4BE",
    text: "#3A1F22",
    muted: "rgba(58, 31, 34, 0.62)",
    accent: "#A85A5A",
    glow: "rgba(168, 90, 90, 0.28)",
    particle: "rgba(196, 120, 120, 0.45)",
  },
  emerald: {
    id: "emerald",
    label: "Emerald",
    background: "#E7EEE8",
    backgroundAlt: "#C7D9CC",
    text: "#1A2A22",
    muted: "rgba(28, 42, 34, 0.62)",
    accent: "#3F6B52",
    glow: "rgba(63, 107, 82, 0.26)",
    particle: "rgba(90, 140, 108, 0.4)",
  },
  ocean: {
    id: "ocean",
    label: "Ocean",
    background: "#E6EEF2",
    backgroundAlt: "#C4D5E0",
    text: "#15232C",
    muted: "rgba(21, 35, 44, 0.62)",
    accent: "#3D6B82",
    glow: "rgba(61, 107, 130, 0.28)",
    particle: "rgba(90, 140, 164, 0.4)",
  },
};

export const DEFAULT_PALETTE: PaletteId = "grace";

export const PALETTE_IDS = Object.keys(PALETTES) as PaletteId[];

const LEGACY_THEME_MAP: Record<string, PaletteId> = {
  sand: "grace",
  terracotta: "sunrise",
  sage: "emerald",
  ember: "golden",
};

export function isPaletteId(value: string): value is PaletteId {
  return value in PALETTES;
}

export function getPalette(id: string | null | undefined): Palette {
  if (id && isPaletteId(id)) return PALETTES[id];
  if (id && LEGACY_THEME_MAP[id]) return PALETTES[LEGACY_THEME_MAP[id]];
  return PALETTES[DEFAULT_PALETTE];
}
