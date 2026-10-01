import type { Metadata } from "next";

import { JsonLd } from "@/components/site/json-ld";
import {
  getFeaturedPhotos,
  getLatestPhotos,
  getPublishedAlbums,
  getPublishedPackages,
  getPublishedTestimonials,
} from "@/lib/data/public";
import { getSiteContext } from "@/lib/data/site";
import { buildPageMetadata, photographerJsonLd } from "@/lib/seo";
import { getTemplate } from "@/templates/registry";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ site: await getSiteContext(), path: "/" });
}

export default async function HomePage() {
  const [site, albums, featuredPhotos, packages, testimonials] = await Promise.all([
    getSiteContext(),
    getPublishedAlbums(),
    getFeaturedPhotos(10),
    getPublishedPackages(),
    getPublishedTestimonials(),
  ]);
  const selectedWork = featuredPhotos.length > 0 ? featuredPhotos : await getLatestPhotos(10);
  const { HomePage: Page } = getTemplate(site.settings.template);

  return (
    <>
      <JsonLd data={photographerJsonLd(site)} />
      <Page
        site={site}
        featuredAlbums={albums.slice(0, 6)}
        selectedWork={selectedWork}
        packages={packages}
        testimonials={testimonials}
      />
    </>
  );
}
