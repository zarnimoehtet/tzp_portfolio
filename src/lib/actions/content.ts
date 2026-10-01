"use server";

import { requireAdmin } from "@/lib/auth";
import { TAGS } from "@/lib/cache-tags";
import type { ActionResult } from "@/lib/types";
import {
  aboutSchema,
  contactSettingsSchema,
  siteSettingsSchema,
  type AboutInput,
  type ContactSettingsInput,
  type SiteSettingsInput,
} from "@/lib/validations";
import {
  assertOwnAsset,
  deleteAssetsLater,
  invalidate,
  nullIfEmpty,
  parseInput,
  replacedAssetKeys,
  runAction,
} from "./utils";

export async function updateAbout(input: AboutInput): Promise<ActionResult> {
  const parsed = parseInput(aboutSchema, input);
  if (!parsed.ok) return parsed.result;

  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const v = parsed.data;
    assertOwnAsset(v.profile_image);

    const { data: previous } = await supabase
      .from("about")
      .select("profile_image")
      .single();

    const { error } = await supabase
      .from("about")
      .update({
        name: v.name,
        headline: nullIfEmpty(v.headline),
        introduction: nullIfEmpty(v.introduction),
        biography: nullIfEmpty(v.biography),
        experience: nullIfEmpty(v.experience),
        years_experience: v.years_experience ? Number(v.years_experience) : null,
        specialties: v.specialties.map((s) => s.value),
        personal_message: nullIfEmpty(v.personal_message),
        profile_image: v.profile_image,
      })
      .eq("id", true);
    if (error) throw error;

    // Keep site-wide branding (header, footer, SEO) in sync with the about name.
    const { error: settingsError } = await supabase
      .from("site_settings")
      .update({ photographer_name: v.name })
      .eq("id", true);
    if (settingsError) throw settingsError;

    deleteAssetsLater(replacedAssetKeys([previous?.profile_image], [v.profile_image]));
    invalidate(TAGS.about, TAGS.settings);
  });
}

export async function updateContactSettings(
  input: ContactSettingsInput,
): Promise<ActionResult> {
  const parsed = parseInput(contactSettingsSchema, input);
  if (!parsed.ok) return parsed.result;

  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const v = parsed.data;
    const { error } = await supabase
      .from("contact_settings")
      .update({
        email: nullIfEmpty(v.email),
        phone: nullIfEmpty(v.phone),
        location: nullIfEmpty(v.location),
        availability: nullIfEmpty(v.availability),
        instagram: nullIfEmpty(v.instagram),
        facebook: nullIfEmpty(v.facebook),
        tiktok: nullIfEmpty(v.tiktok),
        whatsapp: nullIfEmpty(v.whatsapp),
        other_links: v.other_links,
      })
      .eq("id", true);
    if (error) throw error;
    invalidate(TAGS.contact);
  });
}

export async function updateSiteSettings(input: SiteSettingsInput): Promise<ActionResult> {
  const parsed = parseInput(siteSettingsSchema, input);
  if (!parsed.ok) return parsed.result;

  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const v = parsed.data;
    [v.logo, v.favicon, v.hero_image].forEach(assertOwnAsset);

    const { data: previous } = await supabase
      .from("site_settings")
      .select("logo, favicon, hero_image")
      .single();

    const { error } = await supabase
      .from("site_settings")
      .update({
        photographer_name: v.photographer_name,
        logo: v.logo,
        favicon: v.favicon,
        hero_image: v.hero_image,
        hero_title: v.hero_title,
        hero_subtitle: nullIfEmpty(v.hero_subtitle),
        primary_color: v.primary_color.toLowerCase(),
        secondary_color: v.secondary_color.toLowerCase(),
        font_preset: v.font_preset,
        template: v.template,
        seo_title: nullIfEmpty(v.seo_title),
        seo_description: nullIfEmpty(v.seo_description),
      })
      .eq("id", true);
    if (error) throw error;

    // Keep the about-page name aligned with the site-wide brand name.
    const { error: aboutError } = await supabase
      .from("about")
      .update({ name: v.photographer_name })
      .eq("id", true);
    if (aboutError) throw aboutError;

    deleteAssetsLater(
      replacedAssetKeys(
        [previous?.logo, previous?.favicon, previous?.hero_image],
        [v.logo, v.favicon, v.hero_image],
      ),
    );
    invalidate(TAGS.settings, TAGS.about);
  });
}
