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
  /** Classic masonry columns, or wedding-template collage on a dark ground. */
  variant?: "masonry" | "collage";
}

function framed(index: number) {
  return index % 3 === 0 || index % 5 === 1;
}

function CollageTile({
  photo,
  index,
  priority,
  onOpen,
  className,
}: {
  photo: GalleryPhoto;
  index: number;
  priority: boolean;
  onOpen: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn("collage-tile relative min-h-0", className)}
      style={{ animationDelay: `${Math.min(index, 12) * 55}ms` }}
    >
      <button
        type="button"
        onClick={onOpen}
        className="group relative block size-full cursor-zoom-in overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label={`Open ${photo.alt}`}
      >
        <ResponsiveImage
          image={photo.image}
          alt={photo.alt}
          sizes="(min-width: 768px) 40vw, 50vw"
          priority={priority}
          fill
          className="transition-transform duration-[1.1s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.04]"
        />
        {framed(index) && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[7px] border border-white/85 sm:inset-2.5"
          />
        )}
      </button>
    </div>
  );
}

/** Wedding-template mosaic: repeating 3-up blocks, alternating tall side. */
function CollageGallery({
  photos,
  priorityCount,
  className,
  onOpen,
}: {
  photos: GalleryPhoto[];
  priorityCount: number;
  className?: string;
  onOpen: (index: number) => void;
}) {
  const blocks: GalleryPhoto[][] = [];
  for (let i = 0; i < photos.length; i += 3) {
    blocks.push(photos.slice(i, i + 3));
  }

  return (
    <div className={cn("flex flex-col gap-1.5 sm:gap-2 md:gap-2.5", className)}>
      {blocks.map((block, blockIndex) => {
        const base = blockIndex * 3;
        const tallLeft = blockIndex % 2 === 0;

        if (block.length === 1) {
          return (
            <CollageTile
              key={block[0].id}
              photo={block[0]}
              index={base}
              priority={base < priorityCount}
              onOpen={() => onOpen(base)}
              className="aspect-[4/3]"
            />
          );
        }

        if (block.length === 2) {
          return (
            <div
              key={block[0].id}
              className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-2.5"
            >
              {block.map((photo, j) => (
                <CollageTile
                  key={photo.id}
                  photo={photo}
                  index={base + j}
                  priority={base + j < priorityCount}
                  onOpen={() => onOpen(base + j)}
                  className="aspect-square"
                />
              ))}
            </div>
          );
        }

        const [a, b, c] = block;
        return (
          <div
            key={a.id}
            className="grid grid-cols-2 grid-rows-2 gap-1.5 sm:gap-2 md:gap-2.5"
          >
            <CollageTile
              photo={a}
              index={base}
              priority={base < priorityCount}
              onOpen={() => onOpen(base)}
              className={cn(
                "row-span-2 h-full min-h-[14rem] sm:min-h-[18rem] md:min-h-[22rem]",
                tallLeft ? "col-start-1 row-start-1" : "col-start-2 row-start-1",
              )}
            />
            <CollageTile
              photo={b}
              index={base + 1}
              priority={base + 1 < priorityCount}
              onOpen={() => onOpen(base + 1)}
              className={
                tallLeft
                  ? "col-start-2 row-start-1 h-full"
                  : "col-start-1 row-start-1 h-full"
              }
            />
            <CollageTile
              photo={c}
              index={base + 2}
              priority={base + 2 < priorityCount}
              onOpen={() => onOpen(base + 2)}
              className={
                tallLeft
                  ? "col-start-2 row-start-2 h-full"
                  : "col-start-1 row-start-2 h-full"
              }
            />
          </div>
        );
      })}
    </div>
  );
}

/**
 * Gallery with a lightbox. Only the first page is server-rendered;
 * further pages load as the visitor scrolls (or taps "Load more").
 */
export function PhotoGallery({
  initialPhotos,
  albumSlug,
  initialHasMore = false,
  priorityCount = 2,
  className,
  loadMoreLabel = "Load more",
  variant = "masonry",
}: PhotoGalleryProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [active, setActive] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPhotos(initialPhotos);
    setHasMore(initialHasMore);
    setActive(null);
    // Reset only when switching albums; ignore new array identity from the parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- albumSlug is the navigation key
  }, [albumSlug]);

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

  const loadMoreControl = hasMore ? (
    <div ref={sentinel} className="mt-12 flex justify-center">
      <button
        type="button"
        onClick={loadMore}
        disabled={isPending}
        className={cn(
          "eyebrow disabled:opacity-50",
          variant === "collage"
            ? "text-white/55 transition-colors hover:text-white"
            : "link-rule",
        )}
      >
        {isPending ? "Loading…" : loadMoreLabel}
      </button>
    </div>
  ) : null;

  if (variant === "collage") {
    return (
      <>
        <CollageGallery
          photos={photos}
          priorityCount={priorityCount}
          className={className}
          onOpen={setActive}
        />
        {loadMoreControl}
        <Lightbox
          photos={photos}
          index={active}
          onIndexChange={setActive}
          onNearEnd={hasMore ? loadMore : undefined}
        />
      </>
    );
  }

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

      {loadMoreControl}

      <Lightbox
        photos={photos}
        index={active}
        onIndexChange={setActive}
        onNearEnd={hasMore ? loadMore : undefined}
      />
    </>
  );
}
