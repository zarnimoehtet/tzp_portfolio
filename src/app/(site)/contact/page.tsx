import type { Metadata } from "next";

import { getPublishedPackages } from "@/lib/data/public";
import { getSiteContext } from "@/lib/data/site";
import { buildPageMetadata } from "@/lib/seo";
import { getTemplate } from "@/templates/registry";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContext();
  return buildPageMetadata({
    site,
    title: "Contact",
    description: `Get in touch with ${site.about.name} to book a session.`,
    path: "/contact",
  });
}

export default async function ContactPage() {
  const [site, packages] = await Promise.all([getSiteContext(), getPublishedPackages()]);
  const { ContactPage: Page } = getTemplate(site.settings.template);
  return <Page site={site} packages={packages} />;
}
