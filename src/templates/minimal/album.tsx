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
      <Container className="pt-24 pb-6 md:pt-36 md:pb-14">
        <nav aria-label="Breadcrumb" className="fade-up">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-xs text-muted-ink transition-colors hover:text-ink md:px-4 md:py-2 md:text-sm"
          >
            ← Portfolio
          </Link>
        </nav>
        <div className="mt-6 md:mt-10 md:grid md:grid-cols-12 md:gap-8">
          <div className="md:col-span-8">
            {album.category && (
              <SectionLabel className="fade-up">{album.category}</SectionLabel>
            )}
            <h1 className="fade-up mt-3 font-display text-[2.5rem] leading-[1.05] tracking-[-0.035em] [animation-delay:100ms] md:mt-4 md:text-7xl">
              {album.name}
            </h1>
          </div>
          <div className="fade-up mt-4 flex flex-col gap-2 [animation-delay:200ms] md:col-span-4 md:mt-0 md:justify-end md:gap-3">
            {album.description && (
              <p className="text-sm leading-relaxed whitespace-pre-line text-muted-ink md:text-[0.975rem]">
                {album.description}
              </p>
            )}
            <p className="text-xs text-muted-ink md:text-sm">
              {album.photo_count} photographs
            </p>
          </div>
        </div>
      </Container>

      {/* Full-bleed on mobile; each photo keeps its natural width/height */}
      <div className="pb-16 md:mx-auto md:max-w-[1200px] md:px-8 md:pb-28">
        {photos.length > 0 ? (
          <PhotoGallery
            initialPhotos={photos}
            albumSlug={album.slug}
            initialHasMore={hasMore}
            priorityCount={3}
            variant="natural"
          />
        ) : (
          <div className="px-5">
            <EmptyState>Photographs for this story are on their way.</EmptyState>
          </div>
        )}
      </div>

      {(previous || next) && (
        <nav aria-label="More stories" className="border-t border-line">
          <Container className="grid grid-cols-2 gap-4 py-10 md:gap-6 md:py-16">
            <div>
              {previous && (
                <Link href={`/portfolio/${previous.slug}`} className="group block">
                  <p className="text-xs font-medium text-muted-ink">← Previous</p>
                  <p className="mt-2 font-display text-lg leading-snug tracking-[-0.02em] transition-opacity group-hover:opacity-60 md:mt-3 md:text-3xl">
                    {previous.name}
                  </p>
                </Link>
              )}
            </div>
            <div className="text-right">
              {next && (
                <Link href={`/portfolio/${next.slug}`} className="group block">
                  <p className="text-xs font-medium text-muted-ink">Next →</p>
                  <p className="mt-2 font-display text-lg leading-snug tracking-[-0.02em] transition-opacity group-hover:opacity-60 md:mt-3 md:text-3xl">
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
