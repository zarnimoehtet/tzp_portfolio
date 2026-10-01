import { buildSrcSet } from "@/lib/images/helpers";
import type { ImageAsset } from "@/lib/images/types";
import { cn } from "@/lib/utils";

interface ResponsiveImageProps {
  image: ImageAsset;
  alt: string;
  /** Rendered width hints, e.g. "(min-width: 1024px) 33vw, 50vw". */
  sizes: string;
  /** Above-the-fold images: eager load with high fetch priority. */
  priority?: boolean;
  /** Fill the positioned parent (object-cover) instead of intrinsic sizing. */
  fill?: boolean;
  className?: string;
}

/**
 * Plain <img> with srcset over the pre-generated R2 variants. Images are
 * already optimized at upload time, so no runtime image optimizer is needed.
 * Width/height prevent layout shift; the blur preview paints underneath.
 */
export function ResponsiveImage({
  image,
  alt,
  sizes,
  priority = false,
  fill = false,
  className,
}: ResponsiveImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.medium_url}
      srcSet={buildSrcSet(image)}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding={priority ? "sync" : "async"}
      style={
        image.blur_data_url
          ? {
              backgroundImage: `url(${image.blur_data_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
      className={cn(
        "bg-veil",
        fill ? "absolute inset-0 size-full object-cover" : "h-auto w-full",
        className,
      )}
    />
  );
}
