import { z } from "zod";

import { IMAGE_KINDS } from "@/lib/images/config";
import { FONT_PRESET_IDS } from "@/lib/fonts/presets";
import { TEMPLATE_IDS } from "@/templates/ids";

/* -------------------------------------------------------------------------- */
/* Primitives                                                                 */
/* -------------------------------------------------------------------------- */

const text = (max: number) => z.string().trim().max(max);
const requiredText = (max: number, label = "This field") =>
  z.string().trim().min(1, `${label} is required`).max(max);

export const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes");

const optionalUrl = z.union([z.literal(""), z.url("Enter a full URL (https://…)")]);
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #1a1a1a");

export const imageAssetSchema = z.object({
  kind: z.enum(IMAGE_KINDS),
  key: z.string().min(1),
  url: z.url(),
  medium_url: z.url(),
  thumbnail_url: z.url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  medium_width: z.number().int().positive(),
  thumbnail_width: z.number().int().positive(),
  blur_data_url: z.string().startsWith("data:image/").max(4000).nullable(),
});

/* -------------------------------------------------------------------------- */
/* Auth                                                                       */
/* -------------------------------------------------------------------------- */

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;

/* -------------------------------------------------------------------------- */
/* Albums & photos                                                            */
/* -------------------------------------------------------------------------- */

export const albumSchema = z.object({
  name: requiredText(160, "Name"),
  slug: slugSchema,
  category: text(60),
  description: text(2000),
  is_published: z.boolean(),
});
export type AlbumInput = z.infer<typeof albumSchema>;

export const photoUpdateSchema = z.object({
  title: text(160),
  description: text(1000),
  alt_text: text(300),
  album_id: z.uuid().nullable(),
  is_published: z.boolean(),
  is_featured: z.boolean(),
});
export type PhotoUpdateInput = z.infer<typeof photoUpdateSchema>;

/* -------------------------------------------------------------------------- */
/* Packages & testimonials                                                    */
/* -------------------------------------------------------------------------- */

export const packageSchema = z.object({
  name: requiredText(120, "Name"),
  slug: slugSchema,
  description: text(1000),
  price: z
    .string()
    .trim()
    .regex(/^(\d{1,10}(\.\d{1,2})?)?$/, "Enter a number like 300 or 299.99"),
  currency: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/, "Use a 3-letter currency code"),
  duration: text(80),
  cta_label: text(40),
  is_featured: z.boolean(),
  is_published: z.boolean(),
  features: z
    .array(z.object({ value: requiredText(200, "Feature") }))
    .max(30),
});
export type PackageInput = z.infer<typeof packageSchema>;

export const testimonialSchema = z.object({
  name: requiredText(120, "Name"),
  role: text(120),
  content: requiredText(2000, "Testimonial"),
  avatar: imageAssetSchema.nullable(),
  is_published: z.boolean(),
});
export type TestimonialInput = z.infer<typeof testimonialSchema>;

/* -------------------------------------------------------------------------- */
/* Website content                                                            */
/* -------------------------------------------------------------------------- */

export const aboutSchema = z.object({
  name: requiredText(120, "Name"),
  headline: text(200),
  introduction: text(600),
  biography: text(8000),
  experience: text(4000),
  years_experience: z
    .string()
    .trim()
    .regex(/^\d{0,3}$/, "Enter a whole number"),
  specialties: z.array(z.object({ value: requiredText(60, "Specialty") })).max(20),
  personal_message: text(2000),
  profile_image: imageAssetSchema.nullable(),
});
export type AboutInput = z.infer<typeof aboutSchema>;

export const contactSettingsSchema = z.object({
  email: z.union([z.literal(""), z.email("Enter a valid email")]),
  phone: text(40),
  location: text(160),
  availability: text(300),
  instagram: optionalUrl,
  facebook: optionalUrl,
  tiktok: optionalUrl,
  whatsapp: text(40),
  other_links: z
    .array(z.object({ label: requiredText(40, "Label"), url: z.url("Enter a full URL") }))
    .max(10),
});
export type ContactSettingsInput = z.infer<typeof contactSettingsSchema>;

export const siteSettingsSchema = z.object({
  photographer_name: requiredText(120, "Photographer name"),
  logo: imageAssetSchema.nullable(),
  favicon: imageAssetSchema.nullable(),
  hero_image: imageAssetSchema.nullable(),
  hero_title: requiredText(200, "Hero title"),
  hero_subtitle: text(300),
  primary_color: hexColor,
  secondary_color: hexColor,
  font_preset: z.enum(FONT_PRESET_IDS),
  template: z.enum(TEMPLATE_IDS),
  seo_title: text(70),
  seo_description: text(160),
});
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

/* -------------------------------------------------------------------------- */
/* Public contact form                                                        */
/* -------------------------------------------------------------------------- */

export const inquirySchema = z.object({
  name: requiredText(120, "Name"),
  email: z.email("Enter a valid email"),
  phone: text(40),
  event_type: text(80),
  event_date: z.union([z.literal(""), z.iso.date("Enter a valid date")]),
  package_name: text(120),
  message: requiredText(5000, "Message"),
  /** Honeypot — must stay empty. */
  website: z.string().max(0).optional(),
});
export type InquiryInput = z.infer<typeof inquirySchema>;
