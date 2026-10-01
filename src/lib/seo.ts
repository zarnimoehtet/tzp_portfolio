import type { Metadata } from "next";

import { getSiteUrl } from "@/lib/env";
import type { ImageAsset } from "@/lib/types";
import type { SiteContext } from "@/templates/types";

interface PageMetaInput {
  site: SiteContext;
  title?: string;
  description?: string | null;
  path: string;
  image?: ImageAsset | null;
}

function ogImage(image: ImageAsset | null | undefined, alt: string) {
  if (!image) return undefined;
  // The medium variant (~1200–1400px) matches social card sizes well.
  const width = image.medium_width;
  const height = Math.round((image.height / image.width) * width);
  return [{ url: image.medium_url, width, height, alt }];
}

export function defaultDescription(site: SiteContext): string {
  return (
    site.settings.seo_description ||
    site.settings.hero_subtitle ||
    site.about.introduction ||
    `${site.about.name} — photography portfolio.`
  );
}

/** Per-page metadata with canonical URL, Open Graph and X/Twitter cards. */
export function buildPageMetadata({
  site,
  title,
  description,
  path,
  image,
}: PageMetaInput): Metadata {
  const name = site.about.name;
  const desc = description || defaultDescription(site);
  const fullTitle = title ? `${title} — ${name}` : site.settings.seo_title || name;
  const images = ogImage(image ?? site.settings.hero_image, title ?? name);

  return {
    title: title ?? { absolute: fullTitle },
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: name,
      title: fullTitle,
      description: desc,
      url: path,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: fullTitle,
      description: desc,
      images: images?.map((i) => i.url),
    },
  };
}

/** schema.org description of the photographer's business. */
export function photographerJsonLd(site: SiteContext) {
  const url = getSiteUrl();
  const { settings, contact, about, socialLinks } = site;
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${url}/#business`,
    name: about.name,
    url,
    description: defaultDescription(site),
    image: settings.hero_image?.medium_url ?? about.profile_image?.medium_url,
    logo: settings.logo?.url,
    email: contact.email ?? undefined,
    telephone: contact.phone ?? undefined,
    areaServed: contact.location ?? undefined,
    sameAs: socialLinks.map((l) => l.url),
    founder: {
      "@type": "Person",
      name: about.name,
      jobTitle: about.headline ?? "Photographer",
      image: about.profile_image?.medium_url,
      knowsAbout: about.specialties,
    },
  };
}
