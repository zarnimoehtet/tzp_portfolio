import Link from "next/link";

import { PhotoGallery } from "@/components/site/photo-gallery";
import type { AlbumPageProps } from "@/templates/types";
import { EmptyState } from "./components";

export function MinimalAlbumPage({
  album,
  photos,
  hasMore,
  previous,
  next,
}: AlbumPageProps) {
  return (
    <div className="album-collage bg-[#3a1218] text-white">
      <header className="mx-auto max-w-[1200px] px-4 pt-24 pb-8 md:px-8 md:pt-28 md:pb-10">
        <nav aria-label="Breadcrumb" className="fade-up">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-xs tracking-[0.22em] text-white/55 uppercase transition-colors hover:text-white"
          >
            ← Portfolio
          </Link>
        </nav>
        <div className="mt-8 max-w-2xl">
          {album.category && (
            <p className="fade-up text-[0.7rem] tracking-[0.28em] text-white/50 uppercase">
              {album.category}
            </p>
          )}
          <h1 className="fade-up mt-3 font-display text-4xl tracking-[-0.035em] [animation-delay:100ms] md:text-6xl">
            {album.name}
          </h1>
          {album.description && (
            <p className="fade-up mt-4 max-w-md text-sm leading-relaxed text-white/65 [animation-delay:180ms] md:text-base">
              {album.description}
            </p>
          )}
          <p className="fade-up mt-3 text-xs tracking-[0.18em] text-white/40 uppercase [animation-delay:240ms]">
            {album.photo_count} photographs
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-1.5 pb-16 sm:px-2 md:px-4 md:pb-24">
        {photos.length > 0 ? (
          <PhotoGallery
            initialPhotos={photos}
            albumSlug={album.slug}
            initialHasMore={hasMore}
            priorityCount={4}
            variant="collage"
          />
        ) : (
          <div className="px-4">
            <EmptyState>Photographs for this story are on their way.</EmptyState>
          </div>
        )}
      </div>

      {(previous || next) && (
        <nav
          aria-label="More stories"
          className="border-t border-white/10"
        >
          <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-6 px-5 py-12 md:px-8 md:py-16">
            <div>
              {previous && (
                <Link href={`/portfolio/${previous.slug}`} className="group block">
                  <p className="text-xs tracking-[0.18em] text-white/45 uppercase">← Previous</p>
                  <p className="mt-3 font-display text-xl tracking-[-0.02em] transition-opacity group-hover:opacity-60 md:text-3xl">
                    {previous.name}
                  </p>
                </Link>
              )}
            </div>
            <div className="text-right">
              {next && (
                <Link href={`/portfolio/${next.slug}`} className="group block">
                  <p className="text-xs tracking-[0.18em] text-white/45 uppercase">Next →</p>
                  <p className="mt-3 font-display text-xl tracking-[-0.02em] transition-opacity group-hover:opacity-60 md:text-3xl">
                    {next.name}
                  </p>
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
