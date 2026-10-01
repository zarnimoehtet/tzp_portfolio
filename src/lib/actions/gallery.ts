"use server";

import { z } from "zod";

import { getAlbumBySlug, getAlbumPhotos, type PhotoPage } from "@/lib/data/public";

/** Progressive loading for public album galleries (served from the cache). */
export async function loadAlbumPhotos(slug: string, offset: number): Promise<PhotoPage> {
  const parsed = z
    .object({ slug: z.string().max(120), offset: z.number().int().min(0).max(100_000) })
    .safeParse({ slug, offset });
  if (!parsed.success) return { photos: [], hasMore: false };

  const album = await getAlbumBySlug(parsed.data.slug);
  if (!album) return { photos: [], hasMore: false };
  return getAlbumPhotos(album.id, album.name, parsed.data.offset);
}
