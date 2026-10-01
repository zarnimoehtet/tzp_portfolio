"use server";

import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { TAGS } from "@/lib/cache-tags";
import { assetToPhotoColumns } from "@/lib/images/helpers";
import type { ActionResult, Photo } from "@/lib/types";
import {
  imageAssetSchema,
  photoUpdateSchema,
  type PhotoUpdateInput,
} from "@/lib/validations";
import {
  assertOwnAsset,
  deleteAssetsLater,
  invalidate,
  nullIfEmpty,
  parseInput,
  runAction,
} from "./utils";

type AdminClient = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

const idsSchema = z.array(z.uuid()).min(1).max(1000);

/** Ensures an album has a cover, defaulting to its first photo. */
async function ensureAlbumCover(supabase: AdminClient, albumId: string | null) {
  if (!albumId) return;
  const { data: album } = await supabase
    .from("albums")
    .select("cover_photo_id")
    .eq("id", albumId)
    .single();
  if (!album || album.cover_photo_id) return;
  const { data: first } = await supabase
    .from("photos")
    .select("id")
    .eq("album_id", albumId)
    .order("sort_order")
    .order("created_at")
    .limit(1)
    .maybeSingle();
  if (first) {
    await supabase.from("albums").update({ cover_photo_id: first.id }).eq("id", albumId);
  }
}

const createPhotosSchema = z.object({
  albumId: z.uuid().nullable(),
  items: z
    .array(z.object({ asset: imageAssetSchema, filename: z.string().max(255) }))
    .min(1)
    .max(200),
});

export async function createPhotos(
  input: z.infer<typeof createPhotosSchema>,
): Promise<ActionResult<Photo[]>> {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const parsed = createPhotosSchema.parse(input);
    parsed.items.forEach(({ asset }) => assertOwnAsset(asset));

    // Append after the current last photo in the target album.
    let lastQuery = supabase.from("photos").select("sort_order");
    lastQuery = parsed.albumId
      ? lastQuery.eq("album_id", parsed.albumId)
      : lastQuery.is("album_id", null);
    const { data: last } = await lastQuery
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const start = (last?.sort_order ?? -1) + 1;

    const { data, error } = await supabase
      .from("photos")
      .insert(
        parsed.items.map(({ asset }, i) => ({
          ...assetToPhotoColumns(asset),
          album_id: parsed.albumId,
          sort_order: start + i,
        })),
      )
      .select();
    if (error) throw error;

    await ensureAlbumCover(supabase, parsed.albumId);
    invalidate(TAGS.photos, TAGS.albums);
    return data;
  });
}

export async function updatePhoto(
  id: string,
  input: PhotoUpdateInput,
): Promise<ActionResult> {
  const parsed = parseInput(photoUpdateSchema, input);
  if (!parsed.ok) return parsed.result;

  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const values = parsed.data;
    const { error } = await supabase
      .from("photos")
      .update({
        title: nullIfEmpty(values.title),
        description: nullIfEmpty(values.description),
        alt_text: nullIfEmpty(values.alt_text),
        album_id: values.album_id,
        is_published: values.is_published,
        is_featured: values.is_featured,
      })
      .eq("id", z.uuid().parse(id));
    if (error) throw error;

    await ensureAlbumCover(supabase, values.album_id);
    invalidate(TAGS.photos, TAGS.albums);
  });
}

const flagSchema = z.enum(["is_published", "is_featured"]);

export async function setPhotosFlag(
  ids: string[],
  flag: z.infer<typeof flagSchema>,
  value: boolean,
): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const column = flagSchema.parse(flag);
    const checked = z.boolean().parse(value);
    const { error } = await supabase
      .from("photos")
      .update(column === "is_published" ? { is_published: checked } : { is_featured: checked })
      .in("id", idsSchema.parse(ids));
    if (error) throw error;
    invalidate(TAGS.photos, TAGS.albums);
  });
}

export async function movePhotos(
  ids: string[],
  albumId: string | null,
): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const target = z.uuid().nullable().parse(albumId);
    const { error } = await supabase
      .from("photos")
      .update({ album_id: target })
      .in("id", idsSchema.parse(ids));
    if (error) throw error;
    await ensureAlbumCover(supabase, target);
    invalidate(TAGS.photos, TAGS.albums);
  });
}

export async function deletePhotos(ids: string[]): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const validIds = idsSchema.parse(ids);

    const { data: photos, error } = await supabase
      .from("photos")
      .delete()
      .in("id", validIds)
      .select("storage_key, album_id");
    if (error) throw error;

    const albumIds = new Set(photos.map((p) => p.album_id));
    for (const albumId of albumIds) await ensureAlbumCover(supabase, albumId);

    deleteAssetsLater(photos.map((p) => p.storage_key));
    invalidate(TAGS.photos, TAGS.albums);
  });
}

export async function reorderPhotos(ids: string[]): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.rpc("reorder_items", {
      p_table: "photos",
      p_ids: idsSchema.parse(ids),
    });
    if (error) throw error;
    invalidate(TAGS.photos);
  });
}

export async function setAlbumCover(
  albumId: string,
  photoId: string,
): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("albums")
      .update({ cover_photo_id: z.uuid().parse(photoId) })
      .eq("id", z.uuid().parse(albumId));
    if (error) throw error;
    invalidate(TAGS.albums);
  });
}
