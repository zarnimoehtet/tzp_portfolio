import type { Metadata } from "next";

import { getPublishedAlbums } from "@/lib/data/public";
import { getSiteContext } from "@/lib/data/site";
import { buildPageMetadata } from "@/lib/seo";
import { getTemplate } from "@/templates/registry";

export async function generateMetadata(): Promise<Metadata> {
  const [site, albums] = await Promise.all([getSiteContext(), getPublishedAlbums()]);
  return buildPageMetadata({
    site,
    title: "Portfolio",
    description: `Photography stories by ${site.about.name}.`,
    path: "/portfolio",
    image: albums[0]?.cover,
  });
}

export default async function PortfolioPage() {
  const [site, albums] = await Promise.all([getSiteContext(), getPublishedAlbums()]);
  const { PortfolioPage: Page } = getTemplate(site.settings.template);
  return <Page site={site} albums={albums} />;
}
