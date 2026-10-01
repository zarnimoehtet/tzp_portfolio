"use server";

import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { TAGS } from "@/lib/cache-tags";
import type { ActionResult, Album } from "@/lib/types";
import { albumSchema, type AlbumInput } from "@/lib/validations";
import { invalidate, nullIfEmpty, parseInput, runAction } from "./utils";

function toRow(values: AlbumInput) {
  return {
    name: values.name,
    slug: values.slug,
    category: nullIfEmpty(values.category),
    description: nullIfEmpty(values.description),
    is_published: values.is_published,
  };
}

export async function createAlbum(input: AlbumInput): Promise<ActionResult<Album>> {
  const parsed = parseInput(albumSchema, input);
  if (!parsed.ok) return parsed.result;

  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const { data: last } = await supabase
      .from("albums")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data, error } = await supabase
      .from("albums")
      .insert({ ...toRow(parsed.data), sort_order: (last?.sort_order ?? -1) + 1 })
      .select()
      .single();
    if (error) throw error;
    invalidate(TAGS.albums);
    return data;
  });
}

export async function updateAlbum(id: string, input: AlbumInput): Promise<ActionResult> {
  const parsed = parseInput(albumSchema, input);
  if (!parsed.ok) return parsed.result;

  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("albums")
      .update(toRow(parsed.data))
      .eq("id", z.uuid().parse(id));
    if (error) throw error;
    invalidate(TAGS.albums, TAGS.photos);
  });
}

export async function setAlbumPublished(id: string, value: boolean): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("albums")
      .update({ is_published: z.boolean().parse(value) })
      .eq("id", z.uuid().parse(id));
    if (error) throw error;
    invalidate(TAGS.albums, TAGS.photos);
  });
}

/** Photos in the album are kept and become unassigned. */
export async function deleteAlbum(id: string): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("albums").delete().eq("id", z.uuid().parse(id));
    if (error) throw error;
    invalidate(TAGS.albums, TAGS.photos);
  });
}

export async function reorderAlbums(ids: string[]): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.rpc("reorder_items", {
      p_table: "albums",
      p_ids: z.array(z.uuid()).min(1).parse(ids),
    });
    if (error) throw error;
    invalidate(TAGS.albums);
  });
}
