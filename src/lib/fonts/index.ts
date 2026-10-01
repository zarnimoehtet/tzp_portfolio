import {
  Cormorant_Garamond,
  DM_Sans,
  Fraunces,
  Inter,
  Manrope,
  Playfair_Display,
} from "next/font/google";

import { isFontPreset, type FontPresetId } from "./presets";

/** Default pairing — preloaded. */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/** Alternate pairings — only downloaded when a page actually uses them. */
const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
  preload: false,
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  preload: false,
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
  preload: false,
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  preload: false,
});

/** Registers every font family as a CSS variable on <html>. */
export const fontVariables = [
  cormorant.variable,
  inter.variable,
  playfair.variable,
  dmSans.variable,
  fraunces.variable,
  manrope.variable,
].join(" ");

const PRESET_VARIABLES: Record<FontPresetId, { display: string; body: string }> = {
  classic: { display: "var(--font-cormorant)", body: "var(--font-inter)" },
  modern: { display: "var(--font-playfair)", body: "var(--font-dm-sans)" },
  editorial: { display: "var(--font-fraunces)", body: "var(--font-manrope)" },
};

export function fontPresetStyle(preset: string) {
  const vars = PRESET_VARIABLES[isFontPreset(preset) ? preset : "classic"];
  return {
    "--site-font-display": vars.display,
    "--site-font-body": vars.body,
  } as React.CSSProperties;
}
