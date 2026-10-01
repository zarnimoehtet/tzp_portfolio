import type { ImageKind } from "./config";

/**
 * A processed, web-ready image stored in R2. Persisted as JSON for settings
 * images (hero, logo, portrait, avatars) and as columns for gallery photos.
 */
export interface ImageAsset {
  kind: ImageKind;
  /** R2 key prefix that owns every variant of this image. */
  key: string;
  url: string;
  medium_url: string;
  thumbnail_url: string;
  /** Dimensions of the large variant. */
  width: number;
  height: number;
  medium_width: number;
  thumbnail_width: number;
  blur_data_url: string | null;
}
