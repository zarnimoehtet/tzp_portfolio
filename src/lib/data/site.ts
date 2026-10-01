import "server-only";

import { cache } from "react";

import { getSocialLinks } from "@/lib/format";
import type { SiteContext } from "@/templates/types";
import { getAbout, getContactSettings, getSiteSettings } from "./public";

/** Everything every public page needs, deduplicated per request. */
export const getSiteContext = cache(async (): Promise<SiteContext> => {
  const [settings, contact, about] = await Promise.all([
    getSiteSettings(),
    getContactSettings(),
    getAbout(),
  ]);
  return { settings, contact, about, socialLinks: getSocialLinks(contact) };
});
