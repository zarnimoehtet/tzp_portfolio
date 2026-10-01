import { IMAGE_SPECS } from "./config";
import type { ImageAsset } from "./types";

type PhotoImageColumns = {
  storage_key: string;
  image_url: string;
  medium_url: string;
  thumbnail_url: string;
  width: number;
  height: number;
  blur_data_url: string | null;
};

/** Gallery photos store variants as columns; normalize to an ImageAsset. */
export function photoToAsset(photo: PhotoImageColumns): ImageAsset {
  const spec = IMAGE_SPECS.photo;
  return {
    kind: "photo",
    key: photo.storage_key,
    url: photo.image_url,
    medium_url: photo.medium_url,
    thumbnail_url: photo.thumbnail_url,
    width: photo.width,
    height: photo.height,
    medium_width: Math.min(spec.medium.width, photo.width),
    thumbnail_width: Math.min(spec.thumbnail.width, photo.width),
    blur_data_url: photo.blur_data_url,
  };
}

export function assetToPhotoColumns(asset: ImageAsset): PhotoImageColumns {
  return {
    storage_key: asset.key,
    image_url: asset.url,
    medium_url: asset.medium_url,
    thumbnail_url: asset.thumbnail_url,
    width: asset.width,
    height: asset.height,
    blur_data_url: asset.blur_data_url,
  };
}

/** `srcset` from the three stored variants, de-duplicated for small images. */
export function buildSrcSet(asset: ImageAsset): string {
  const entries = new Map<number, string>([
    [asset.thumbnail_width, asset.thumbnail_url],
    [asset.medium_width, asset.medium_url],
    [asset.width, asset.url],
  ]);
  return [...entries]
    .sort(([a], [b]) => a - b)
    .map(([w, url]) => `${url} ${w}w`)
    .join(", ");
}
