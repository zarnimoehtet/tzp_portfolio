"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { loadAlbumPhotos } from "@/lib/actions/gallery";
import type { GalleryPhoto } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Lightbox } from "./lightbox";
import { ResponsiveImage } from "./responsive-image";

interface PhotoGalleryProps {
  initialPhotos: GalleryPhoto[];
  /** When set, more photos are fetched progressively for this album. */
  albumSlug?: string;
  initialHasMore?: boolean;
  /** Number of photos rendered eagerly (above the fold). */
  priorityCount?: number;
  className?: string;
  loadMoreLabel?: string;
}

/**
 * Masonry gallery with a lightbox. Only the first page is server-rendered;
 * further pages load as the visitor scrolls (or taps "Load more").
 */
export function PhotoGallery({
  initialPhotos,
  albumSlug,
  initialHasMore = false,
  priorityCount = 2,
  className,
  loadMoreLabel = "Load more",
}: PhotoGalleryProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [active, setActive] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const sentinel = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    if (!albumSlug || !hasMore || isPending) return;
    startTransition(async () => {
      const page = await loadAlbumPhotos(albumSlug, photos.length);
      setPhotos((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...page.photos.filter((p) => !seen.has(p.id))];
      });
      setHasMore(page.hasMore);
    });
  }, [albumSlug, hasMore, isPending, photos.length]);

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0]?.isIntersecting && loadMore(),
      { rootMargin: "800px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <>
      <ul className={cn("columns-1 gap-3 sm:columns-2 md:gap-5 lg:columns-3", className)}>
        {photos.map((photo, i) => (
          <li key={photo.id} className="mb-3 break-inside-avoid md:mb-5">
            <button
              type="button"
              onClick={() => setActive(i)}
              className="group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink md:rounded-[1.25rem]"
              aria-label={`Open ${photo.alt}`}
            >
              <ResponsiveImage
                image={photo.image}
                alt={photo.alt}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                priority={i < priorityCount}
                className="transition-transform duration-[1.2s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.025]"
              />
            </button>
          </li>
        ))}
      </ul>

      {hasMore && (
        <div ref={sentinel} className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={isPending}
            className="eyebrow link-rule disabled:opacity-50"
          >
            {isPending ? "Loading…" : loadMoreLabel}
          </button>
        </div>
      )}

      <Lightbox
        photos={photos}
        index={active}
        onIndexChange={setActive}
        onNearEnd={hasMore ? loadMore : undefined}
      />
    </>
  );
}
