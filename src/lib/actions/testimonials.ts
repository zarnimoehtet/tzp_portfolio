"use server";

import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { TAGS } from "@/lib/cache-tags";
import type { ActionResult } from "@/lib/types";
import { testimonialSchema, type TestimonialInput } from "@/lib/validations";
import {
  assertOwnAsset,
  deleteAssetsLater,
  invalidate,
  nullIfEmpty,
  parseInput,
  replacedAssetKeys,
  runAction,
} from "./utils";

function toRow(values: TestimonialInput) {
  return {
    name: values.name,
    role: nullIfEmpty(values.role),
    content: values.content,
    avatar: values.avatar,
    is_published: values.is_published,
  };
}

export async function createTestimonial(input: TestimonialInput): Promise<ActionResult> {
  const parsed = parseInput(testimonialSchema, input);
  if (!parsed.ok) return parsed.result;

  return runAction(async () => {
    const { supabase } = await requireAdmin();
    assertOwnAsset(parsed.data.avatar);
    const { data: last } = await supabase
      .from("testimonials")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { error } = await supabase
      .from("testimonials")
      .insert({ ...toRow(parsed.data), sort_order: (last?.sort_order ?? -1) + 1 });
    if (error) throw error;
    invalidate(TAGS.testimonials);
  });
}

export async function updateTestimonial(
  id: string,
  input: TestimonialInput,
): Promise<ActionResult> {
  const parsed = parseInput(testimonialSchema, input);
  if (!parsed.ok) return parsed.result;

  return runAction(async () => {
    const { supabase } = await requireAdmin();
    assertOwnAsset(parsed.data.avatar);
    const testimonialId = z.uuid().parse(id);
    const { data: previous } = await supabase
      .from("testimonials")
      .select("avatar")
      .eq("id", testimonialId)
      .single();
    const { error } = await supabase
      .from("testimonials")
      .update(toRow(parsed.data))
      .eq("id", testimonialId);
    if (error) throw error;
    deleteAssetsLater(replacedAssetKeys([previous?.avatar], [parsed.data.avatar]));
    invalidate(TAGS.testimonials);
  });
}

export async function setTestimonialPublished(
  id: string,
  value: boolean,
): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("testimonials")
      .update({ is_published: z.boolean().parse(value) })
      .eq("id", z.uuid().parse(id));
    if (error) throw error;
    invalidate(TAGS.testimonials);
  });
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", z.uuid().parse(id))
      .select("avatar")
      .maybeSingle();
    if (error) throw error;
    deleteAssetsLater([data?.avatar?.key]);
    invalidate(TAGS.testimonials);
  });
}

export async function reorderTestimonials(ids: string[]): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.rpc("reorder_items", {
      p_table: "testimonials",
      p_ids: z.array(z.uuid()).min(1).parse(ids),
    });
    if (error) throw error;
    invalidate(TAGS.testimonials);
  });
}
