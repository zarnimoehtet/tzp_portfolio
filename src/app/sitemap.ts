import type { MetadataRoute } from "next";

import { getPublishedAlbums, getSiteSettings } from "@/lib/data/public";
import { getSiteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const [albums, settings] = await Promise.all([getPublishedAlbums(), getSiteSettings()]);

  const staticPages: MetadataRoute.Sitemap = [
    { path: "", priority: 1 },
    { path: "/portfolio", priority: 0.9 },
    { path: "/packages", priority: 0.7 },
    { path: "/about", priority: 0.7 },
    { path: "/contact", priority: 0.6 },
  ].map(({ path, priority }) => ({
    url: `${base}${path}`,
    lastModified: settings.updated_at,
    changeFrequency: "monthly",
    priority,
  }));

  const albumPages: MetadataRoute.Sitemap = albums.map((album) => ({
    url: `${base}/portfolio/${album.slug}`,
    lastModified: album.updated_at,
    changeFrequency: "monthly",
    priority: 0.8,
    images: album.cover ? [album.cover.url] : undefined,
  }));

  return [...staticPages, ...albumPages];
}
