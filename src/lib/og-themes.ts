import { getPalette, PALETTES, type Palette, type PaletteId } from "@/lib/palettes";

export type OgThemeId = PaletteId;
export type OgTheme = Palette;

export const OG_THEMES = PALETTES;
export const DEFAULT_OG_THEME: OgThemeId = "grace";
export const OG_THEME_IDS = Object.keys(PALETTES) as OgThemeId[];

export function getOgTheme(themeId: string | null | undefined): OgTheme {
  return getPalette(themeId);
}
