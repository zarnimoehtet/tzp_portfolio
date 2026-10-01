"use client";

import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { buildSrcSet } from "@/lib/images/helpers";
import type { GalleryPhoto } from "@/lib/types";

interface LightboxProps {
  photos: GalleryPhoto[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
  /** Called when the viewer nears the end so more photos can be loaded. */
  onNearEnd?: () => void;
}

const SWIPE_THRESHOLD = 50;

export function Lightbox({ photos, index, onIndexChange, onNearEnd }: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pointerStart = useRef<number | null>(null);
  const isOpen = index !== null;
  const photo = index !== null ? photos[index] : null;

  const close = useCallback(() => onIndexChange(null), [onIndexChange]);
  const go = useCallback(
    (delta: number) => {
      if (index === null || photos.length === 0) return;
      onIndexChange((index + delta + photos.length) % photos.length);
    },
    [index, photos.length, onIndexChange],
  );

  // Native <dialog> provides focus trapping, Esc handling and the top layer.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      if (!dialog.open) dialog.showModal();
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.documentElement.style.overflow = "";
      };
    }
    if (dialog.open) dialog.close();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, go]);

  // Warm the cache for neighbours and request more photos near the end.
  useEffect(() => {
    if (index === null) return;
    for (const offset of [1, -1]) {
      const neighbour = photos[(index + offset + photos.length) % photos.length];
      if (neighbour) {
        const img = new Image();
        img.sizes = "100vw";
        img.srcset = buildSrcSet(neighbour.image);
      }
    }
    if (index >= photos.length - 3) onNearEnd?.();
  }, [index, photos, onNearEnd]);

  return (
    <dialog
      ref={dialogRef}
      aria-label="Photo viewer"
      onClose={() => {
        if (isOpen) close();
      }}
      className="m-0 h-svh max-h-none w-screen max-w-none bg-[#0c0c0c] p-0 text-white backdrop:bg-black/90"
    >
      {photo && (
        <div
          className="relative flex h-full w-full touch-pan-y items-center justify-center select-none"
          onPointerDown={(e) => (pointerStart.current = e.clientX)}
          onPointerUp={(e) => {
            if (pointerStart.current === null) return;
            const dx = e.clientX - pointerStart.current;
            pointerStart.current = null;
            if (Math.abs(dx) > SWIPE_THRESHOLD) go(dx < 0 ? 1 : -1);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={photo.id}
            src={photo.image.medium_url}
            srcSet={buildSrcSet(photo.image)}
            sizes="100vw"
            alt={photo.alt}
            width={photo.image.width}
            height={photo.image.height}
            draggable={false}
            className="fade-in max-h-[calc(100svh-7rem)] w-auto max-w-[calc(100vw-2rem)] object-contain md:max-w-[calc(100vw-10rem)]"
          />

          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 md:p-6">
            <p className="eyebrow text-white/70 tabular-nums">
              {(index ?? 0) + 1} / {photos.length}
            </p>
            <button
              type="button"
              onClick={close}
              autoFocus
              className="-m-2 p-2 text-white/80 transition hover:text-white"
              aria-label="Close viewer"
            >
              <X className="size-6" strokeWidth={1.25} />
            </button>
          </div>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute top-1/2 left-2 hidden -translate-y-1/2 p-3 text-white/60 transition hover:text-white md:block"
                aria-label="Previous photo"
              >
                <ChevronLeft className="size-8" strokeWidth={1} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute top-1/2 right-2 hidden -translate-y-1/2 p-3 text-white/60 transition hover:text-white md:block"
                aria-label="Next photo"
              >
                <ChevronRight className="size-8" strokeWidth={1} />
              </button>
            </>
          )}

          {(photo.title || photo.description) && (
            <div className="absolute inset-x-0 bottom-0 p-4 text-center md:p-6">
              {photo.title && <p className="font-display text-lg">{photo.title}</p>}
              {photo.description && (
                <p className="mx-auto mt-1 max-w-xl text-sm text-white/60">
                  {photo.description}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
