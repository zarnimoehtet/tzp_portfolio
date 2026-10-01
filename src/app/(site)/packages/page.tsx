import type { Metadata } from "next";

import { getPublishedPackages } from "@/lib/data/public";
import { getSiteContext } from "@/lib/data/site";
import { buildPageMetadata } from "@/lib/seo";
import { getTemplate } from "@/templates/registry";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContext();
  return buildPageMetadata({
    site,
    title: "Packages",
    description: `Photography packages and pricing from ${site.about.name}.`,
    path: "/packages",
  });
}

export default async function PackagesPage() {
  const [site, packages] = await Promise.all([getSiteContext(), getPublishedPackages()]);
  const { PackagesPage: Page } = getTemplate(site.settings.template);
  return <Page site={site} packages={packages} />;
}
