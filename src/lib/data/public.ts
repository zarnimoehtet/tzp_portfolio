import "server-only";

import { unstable_cache } from "next/cache";

import { TAGS } from "@/lib/cache-tags";
import { isSupabaseConfigured } from "@/lib/env";
import { photoToAsset } from "@/lib/images/helpers";
import { createPublicClient } from "@/lib/supabase/server";
import type {
  About,
  Album,
  AlbumWithCover,
  ContactSettings,
  GalleryPhoto,
  PackageWithFeatures,
  Photo,
  SiteSettings,
  Testimonial,
} from "@/lib/types";
import { DEFAULT_ABOUT, DEFAULT_CONTACT, DEFAULT_SITE_SETTINGS } from "./defaults";

/** Public pages refresh at least hourly; admin edits expire tags instantly. */
const REVALIDATE_SECONDS = 3600;

export const GALLERY_PAGE_SIZE = 24;

const PHOTO_COLUMNS =
  "id, album_id, title, description, alt_text, storage_key, image_url, medium_url, thumbnail_url, width, height, blur_data_url";

type PhotoColumns = Pick<
  Photo,
  | "id"
  | "album_id"
  | "title"
  | "description"
  | "alt_text"
  | "storage_key"
  | "image_url"
  | "medium_url"
  | "thumbnail_url"
  | "width"
  | "height"
  | "blur_data_url"
>;

/**
 * Runs a cached query. Errors are thrown inside the cache (so failures are
 * never cached) and converted to a fallback outside it, so a database outage
 * degrades the site instead of crashing it.
 */
function cachedQuery<Args extends unknown[], T>(
  key: string,
  tags: string[],
  fallback: T,
  query: (...args: Args) => Promise<T>,
) {
  const cached = unstable_cache(query, [key], {
    tags,
    revalidate: REVALIDATE_SECONDS,
  });
  return async (...args: Args): Promise<T> => {
    if (!isSupabaseConfigured) return fallback;
    try {
      return await cached(...args);
    } catch (error) {
      console.error(`[data] ${key} failed`, error);
      return fallback;
    }
  };
}

function toGalleryPhoto(photo: PhotoColumns, context?: string): GalleryPhoto {
  return {
    id: photo.id,
    title: photo.title,
    description: photo.description,
    alt:
      photo.alt_text ||
      photo.title ||
      (context ? `${context} — photograph` : "Photograph"),
    image: photoToAsset(photo),
  };
}

/* -------------------------------------------------------------------------- */
/* Singletons                                                                 */
/* -------------------------------------------------------------------------- */

export const getSiteSettings = cachedQuery(
  "site-settings",
  [TAGS.settings],
  DEFAULT_SITE_SETTINGS,
  async (): Promise<SiteSettings> => {
    const { data, error } = await createPublicClient()
      .from("site_settings")
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },
);

export const getAbout = cachedQuery(
  "about",
  [TAGS.about],
  DEFAULT_ABOUT,
  async (): Promise<About> => {
    const { data, error } = await createPublicClient()
      .from("about")
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },
);

export const getContactSettings = cachedQuery(
  "contact",
  [TAGS.contact],
  DEFAULT_CONTACT,
  async (): Promise<ContactSettings> => {
    const { data, error } = await createPublicClient()
      .from("contact_settings")
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },
);

/* -------------------------------------------------------------------------- */
/* Albums & photos                                                            */
/* -------------------------------------------------------------------------- */

const ALBUM_SELECT = `*,
  cover:photos!albums_cover_photo_id_fkey(${PHOTO_COLUMNS}),
  photo_count:photos!photos_album_id_fkey(count)`;

type AlbumRow = Album & {
  cover: PhotoColumns | null;
  photo_count: { count: number }[];
};

function toAlbumWithCover(row: AlbumRow): AlbumWithCover {
  const { cover, photo_count, ...album } = row;
  return {
    ...album,
    cover: cover ? photoToAsset(cover) : null,
    photo_count: photo_count[0]?.count ?? 0,
  };
}

export const getPublishedAlbums = cachedQuery(
  "albums:published",
  [TAGS.albums, TAGS.photos],
  [] as AlbumWithCover[],
  async (): Promise<AlbumWithCover[]> => {
    const { data, error } = await createPublicClient()
      .from("albums")
      .select(ALBUM_SELECT)
      .eq("is_published", true)
      .order("sort_order")
      .order("created_at", { ascending: false })
      .overrideTypes<AlbumRow[], { merge: false }>();
    if (error) throw error;
    return data.map(toAlbumWithCover);
  },
);

export const getAlbumBySlug = cachedQuery(
  "albums:by-slug",
  [TAGS.albums, TAGS.photos],
  null as AlbumWithCover | null,
  async (slug: string): Promise<AlbumWithCover | null> => {
    const { data, error } = await createPublicClient()
      .from("albums")
      .select(ALBUM_SELECT)
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle()
      .overrideTypes<AlbumRow | null, { merge: false }>();
    if (error) throw error;
    return data ? toAlbumWithCover(data) : null;
  },
);

export type PhotoPage = { photos: GalleryPhoto[]; hasMore: boolean };

export const getAlbumPhotos = cachedQuery(
  "photos:album-page",
  [TAGS.photos],
  { photos: [], hasMore: false } as PhotoPage,
  async (
    albumId: string,
    albumName: string,
    offset: number,
    limit: number = GALLERY_PAGE_SIZE,
  ): Promise<PhotoPage> => {
    const { data, error } = await createPublicClient()
      .from("photos")
      .select(PHOTO_COLUMNS)
      .eq("album_id", albumId)
      .eq("is_published", true)
      .order("sort_order")
      .order("created_at")
      // Fetch one extra row to know whether another page exists.
      .range(offset, offset + limit);
    if (error) throw error;
    return {
      photos: data.slice(0, limit).map((p) => toGalleryPhoto(p, albumName)),
      hasMore: data.length > limit,
    };
  },
);

export const getFeaturedPhotos = cachedQuery(
  "photos:featured",
  [TAGS.photos],
  [] as GalleryPhoto[],
  async (limit: number = 9): Promise<GalleryPhoto[]> => {
    const { data, error } = await createPublicClient()
      .from("photos")
      .select(PHOTO_COLUMNS)
      .eq("is_featured", true)
      .eq("is_published", true)
      .order("sort_order")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data.map((p) => toGalleryPhoto(p));
  },
);

export const getLatestPhotos = cachedQuery(
  "photos:latest",
  [TAGS.photos],
  [] as GalleryPhoto[],
  async (limit: number = 10): Promise<GalleryPhoto[]> => {
    const { data, error } = await createPublicClient()
      .from("photos")
      .select(PHOTO_COLUMNS)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data.map((p) => toGalleryPhoto(p));
  },
);

/* -------------------------------------------------------------------------- */
/* Packages & testimonials                                                    */
/* -------------------------------------------------------------------------- */

export const getPublishedPackages = cachedQuery(
  "packages:published",
  [TAGS.packages],
  [] as PackageWithFeatures[],
  async (): Promise<PackageWithFeatures[]> => {
    const { data, error } = await createPublicClient()
      .from("packages")
      .select("*, package_features(*)")
      .eq("is_published", true)
      .order("sort_order")
      .order("created_at");
    if (error) throw error;
    return data.map(({ package_features, ...pkg }) => ({
      ...pkg,
      features: [...package_features].sort((a, b) => a.sort_order - b.sort_order),
    }));
  },
);

export const getPublishedTestimonials = cachedQuery(
  "testimonials:published",
  [TAGS.testimonials],
  [] as Testimonial[],
  async (): Promise<Testimonial[]> => {
    const { data, error } = await createPublicClient()
      .from("testimonials")
      .select("*")
      .eq("is_published", true)
      .order("sort_order")
      .order("created_at");
    if (error) throw error;
    return data;
  },
);
