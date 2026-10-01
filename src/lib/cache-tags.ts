/** Cache tags for public data. Admin mutations expire these via `updateTag`. */
export const TAGS = {
  settings: "site-settings",
  about: "about",
  contact: "contact",
  albums: "albums",
  photos: "photos",
  packages: "packages",
  testimonials: "testimonials",
} as const;

export type CacheTag = (typeof TAGS)[keyof typeof TAGS];
