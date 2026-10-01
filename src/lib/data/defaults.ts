import type { About, ContactSettings, SiteSettings } from "@/lib/types";

/** Used before the database is configured, and as a fallback on errors. */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: true,
  photographer_name: "Photographer Name",
  logo: null,
  favicon: null,
  hero_image: null,
  hero_title: "Capturing stories, people & unforgettable moments.",
  hero_subtitle: "Wedding, portrait & editorial photography.",
  primary_color: "#161616",
  secondary_color: "#f4f4f5",
  font_preset: "classic",
  template: "minimal",
  seo_title: null,
  seo_description: null,
  updated_at: new Date(0).toISOString(),
};

export const DEFAULT_ABOUT: About = {
  id: true,
  name: "Photographer Name",
  headline: "Photographer & visual storyteller",
  introduction:
    "I photograph people and the quiet moments between them — honestly, beautifully, and without fuss.",
  biography: null,
  experience: null,
  years_experience: null,
  specialties: ["Weddings", "Portraits", "Editorial"],
  personal_message: null,
  profile_image: null,
  updated_at: new Date(0).toISOString(),
};

export const DEFAULT_CONTACT: ContactSettings = {
  id: true,
  email: null,
  phone: null,
  location: null,
  availability: null,
  instagram: null,
  facebook: null,
  tiktok: null,
  whatsapp: null,
  other_links: [],
  updated_at: new Date(0).toISOString(),
};
