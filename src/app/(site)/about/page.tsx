import type { Metadata } from "next";

import { getPublishedTestimonials } from "@/lib/data/public";
import { getSiteContext } from "@/lib/data/site";
import { buildPageMetadata } from "@/lib/seo";
import { getTemplate } from "@/templates/registry";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContext();
  return buildPageMetadata({
    site,
    title: "About",
    description: site.about.introduction,
    path: "/about",
    image: site.about.profile_image,
  });
}

export default async function AboutPage() {
  const [site, testimonials] = await Promise.all([
    getSiteContext(),
    getPublishedTestimonials(),
  ]);
  const { AboutPage: Page } = getTemplate(site.settings.template);
  return <Page site={site} testimonials={testimonials} />;
}
