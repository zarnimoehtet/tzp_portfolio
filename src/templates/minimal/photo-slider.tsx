import type { CSSProperties } from "react";

import { ResponsiveImage } from "@/components/site/responsive-image";
import type { GalleryPhoto } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Repeating size rhythm: large square, small portrait, wide landscape. */
const SHAPES = [
  { width: "w-[clamp(15rem,31vw,29rem)]", aspect: "aspect-square", sizes: "31vw" },
  { width: "w-[clamp(10rem,17vw,16rem)]", aspect: "aspect-[6/7]", sizes: "17vw" },
  { width: "w-[clamp(14rem,31vw,29rem)]", aspect: "aspect-[4/3]", sizes: "31vw" },
];

/** Enough slides that one copy of the strip is always wider than the screen. */
const MIN_SLIDES = 8;

function Slide({ photo, index }: { photo: GalleryPhoto; index: number }) {
  const shape = SHAPES[index % SHAPES.length];
  return (
    <figure className={cn("shrink-0 pr-3 md:pr-4", shape.width)}>
      <div className={cn("relative overflow-hidden bg-white/5", shape.aspect)}>
        <ResponsiveImage image={photo.image} alt={photo.alt} sizes={`(min-width: 768px) ${shape.sizes}, 60vw`} fill />
      </div>
      {photo.title && (
        <figcaption className="mt-4 truncate text-lg font-semibold tracking-[-0.02em] uppercase md:mt-5 md:text-2xl">
          {photo.title}
        </figcaption>
      )}
    </figure>
  );
}

export function PhotoSlider({ photos }: { photos: GalleryPhoto[] }) {
  if (photos.length === 0) return null;

  const slides = Array.from(
    { length: Math.ceil(MIN_SLIDES / photos.length) * photos.length },
    (_, i) => photos[i % photos.length],
  );

  return (
    <div
      className="marquee overflow-hidden"
      role="region"
      aria-label="Featured photographs"
      style={{ "--marquee-duration": `${slides.length * 6}s` } as CSSProperties}
    >
      <div className="marquee-track flex w-max items-start">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-start" aria-hidden={copy === 1 || undefined}>
            {slides.map((photo, i) => (
              <Slide key={`${copy}-${i}`} photo={photo} index={i} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
