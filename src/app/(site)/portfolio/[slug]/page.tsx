import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/site/json-ld";
import { getAlbumBySlug, getAlbumPhotos, getPublishedAlbums } from "@/lib/data/public";
import { getSiteContext } from "@/lib/data/site";
import { getSiteUrl } from "@/lib/env";
import { buildPageMetadata } from "@/lib/seo";
import { getTemplate } from "@/templates/registry";

export async function generateStaticParams() {
  const albums = await getPublishedAlbums();
  return albums.map((album) => ({ slug: album.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/portfolio/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [site, album] = await Promise.all([getSiteContext(), getAlbumBySlug(slug)]);
  if (!album) return {};
  return buildPageMetadata({
    site,
    title: album.name,
    description: album.description,
    path: `/portfolio/${album.slug}`,
    image: album.cover,
  });
}

export default async function AlbumPage({ params }: PageProps<"/portfolio/[slug]">) {
  const { slug } = await params;
  const [site, album, albums] = await Promise.all([
    getSiteContext(),
    getAlbumBySlug(slug),
    getPublishedAlbums(),
  ]);
  if (!album) notFound();

  const { photos, hasMore } = await getAlbumPhotos(album.id, album.name, 0);
  const index = albums.findIndex((a) => a.id === album.id);
  const previous = index > 0 ? albums[index - 1] : null;
  const next = index >= 0 && index < albums.length - 1 ? albums[index + 1] : null;
  const { AlbumPage: Page } = getTemplate(site.settings.template);
  const url = `${getSiteUrl()}/portfolio/${album.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          name: album.name,
          description: album.description ?? undefined,
          url,
          author: { "@type": "Person", name: site.about.name },
          image: photos.slice(0, 10).map((p) => ({
            "@type": "ImageObject",
            contentUrl: p.image.url,
            thumbnailUrl: p.image.thumbnail_url,
            width: p.image.width,
            height: p.image.height,
            caption: p.alt,
          })),
        }}
      />
      <Page
        site={site}
        album={album}
        photos={photos}
        hasMore={hasMore}
        previous={previous}
        next={next}
      />
    </>
  );
}
