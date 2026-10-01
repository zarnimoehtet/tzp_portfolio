export const IMAGE_KINDS = [
  "photo",
  "hero",
  "portrait",
  "avatar",
  "logo",
  "favicon",
] as const;

export type ImageKind = (typeof IMAGE_KINDS)[number];

export interface VariantSpec {
  width: number;
  quality: number;
}

export interface ImageKindSpec {
  large: VariantSpec;
  medium: VariantSpec;
  thumbnail: VariantSpec;
  /** Square crop for every variant (avatars, favicons). */
  square?: boolean;
  /** Keep transparency and use a lossless-ish encode (logos, favicons). */
  preserveAlpha?: boolean;
}

/**
 * Output targets per image kind. Widths are upper bounds — images are never
 * enlarged, so a variant may be narrower than its target.
 */
export const IMAGE_SPECS: Record<ImageKind, ImageKindSpec> = {
  photo: {
    large: { width: 2400, quality: 82 },
    medium: { width: 1200, quality: 80 },
    thumbnail: { width: 600, quality: 75 },
  },
  hero: {
    large: { width: 2560, quality: 82 },
    medium: { width: 1400, quality: 80 },
    thumbnail: { width: 720, quality: 75 },
  },
  portrait: {
    large: { width: 1600, quality: 82 },
    medium: { width: 1000, quality: 80 },
    thumbnail: { width: 500, quality: 75 },
  },
  avatar: {
    large: { width: 480, quality: 80 },
    medium: { width: 240, quality: 78 },
    thumbnail: { width: 120, quality: 75 },
    square: true,
  },
  logo: {
    large: { width: 800, quality: 92 },
    medium: { width: 400, quality: 92 },
    thumbnail: { width: 200, quality: 90 },
    preserveAlpha: true,
  },
  favicon: {
    large: { width: 512, quality: 100 },
    medium: { width: 192, quality: 100 },
    thumbnail: { width: 48, quality: 100 },
    square: true,
    preserveAlpha: true,
  },
};

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/tiff",
  "image/gif",
  "image/svg+xml",
] as const;

/** Camera originals can be large; they are deleted right after processing. */
export const MAX_UPLOAD_BYTES = 80 * 1024 * 1024;
