import Link from "next/link";

import { PhotoGallery } from "@/components/site/photo-gallery";
import type { AlbumPageProps } from "@/templates/types";
import { ContactCta, Container, EmptyState, SectionLabel } from "./components";

export function MinimalAlbumPage({
  site,
  album,
  photos,
  hasMore,
  previous,
  next,
}: AlbumPageProps) {
  return (
    <>
      <Container className="pt-28 pb-10 md:pt-36 md:pb-14">
        <nav aria-label="Breadcrumb" className="fade-up">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-muted-ink transition-colors hover:text-ink"
          >
            ← Portfolio
          </Link>
        </nav>
        <div className="mt-10 grid gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            {album.category && (
              <SectionLabel className="fade-up">{album.category}</SectionLabel>
            )}
            <h1 className="fade-up mt-4 font-display text-5xl tracking-[-0.035em] [animation-delay:100ms] md:text-7xl">
              {album.name}
            </h1>
          </div>
          <div className="fade-up flex flex-col justify-end gap-3 [animation-delay:200ms] md:col-span-4">
            {album.description && (
              <p className="text-sm leading-relaxed whitespace-pre-line text-muted-ink md:text-[0.975rem]">
                {album.description}
              </p>
            )}
            <p className="text-sm text-muted-ink">{album.photo_count} photographs</p>
          </div>
        </div>
      </Container>

      <Container className="pb-20 md:pb-28">
        {photos.length > 0 ? (
          <PhotoGallery
            initialPhotos={photos}
            albumSlug={album.slug}
            initialHasMore={hasMore}
            priorityCount={3}
          />
        ) : (
          <EmptyState>Photographs for this story are on their way.</EmptyState>
        )}
      </Container>

      {(previous || next) && (
        <nav aria-label="More stories" className="border-t border-line">
          <Container className="grid grid-cols-2 gap-6 py-12 md:py-16">
            <div>
              {previous && (
                <Link href={`/portfolio/${previous.slug}`} className="group block">
                  <p className="text-xs font-medium text-muted-ink">← Previous</p>
                  <p className="mt-3 font-display text-xl tracking-[-0.02em] transition-opacity group-hover:opacity-60 md:text-3xl">
                    {previous.name}
                  </p>
                </Link>
              )}
            </div>
            <div className="text-right">
              {next && (
                <Link href={`/portfolio/${next.slug}`} className="group block">
                  <p className="text-xs font-medium text-muted-ink">Next →</p>
                  <p className="mt-3 font-display text-xl tracking-[-0.02em] transition-opacity group-hover:opacity-60 md:text-3xl">
                    {next.name}
                  </p>
                </Link>
              )}
            </div>
          </Container>
        </nav>
      )}

      <ContactCta availability={site.contact.availability} />
    </>
  );
}
