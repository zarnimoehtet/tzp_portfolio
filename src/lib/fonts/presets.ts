/** Font pairings selectable from Website Settings. Loaded in `./index.ts`. */
export const FONT_PRESETS = [
  {
    id: "classic",
    label: "Classic — Cormorant Garamond & Inter",
  },
  {
    id: "modern",
    label: "Modern — Playfair Display & DM Sans",
  },
  {
    id: "editorial",
    label: "Editorial — Fraunces & Manrope",
  },
] as const;

export type FontPresetId = (typeof FONT_PRESETS)[number]["id"];

export const FONT_PRESET_IDS = FONT_PRESETS.map((f) => f.id) as [
  FontPresetId,
  ...FontPresetId[],
];

export function isFontPreset(value: string): value is FontPresetId {
  return (FONT_PRESET_IDS as string[]).includes(value);
}
