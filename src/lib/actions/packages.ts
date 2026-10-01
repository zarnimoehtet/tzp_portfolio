"use server";

import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { TAGS } from "@/lib/cache-tags";
import type { ActionResult } from "@/lib/types";
import { packageSchema, type PackageInput } from "@/lib/validations";
import { invalidate, nullIfEmpty, parseInput, runAction } from "./utils";

type AdminClient = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

function toRow(values: PackageInput) {
  return {
    name: values.name,
    slug: values.slug,
    description: nullIfEmpty(values.description),
    price: values.price ? Number(values.price) : null,
    currency: values.currency.toUpperCase(),
    duration: nullIfEmpty(values.duration),
    cta_label: nullIfEmpty(values.cta_label),
    is_featured: values.is_featured,
    is_published: values.is_published,
  };
}

async function replaceFeatures(
  supabase: AdminClient,
  packageId: string,
  features: PackageInput["features"],
) {
  const { error: deleteError } = await supabase
    .from("package_features")
    .delete()
    .eq("package_id", packageId);
  if (deleteError) throw deleteError;
  if (features.length === 0) return;
  const { error } = await supabase.from("package_features").insert(
    features.map((f, i) => ({ package_id: packageId, feature: f.value, sort_order: i })),
  );
  if (error) throw error;
}

export async function createPackage(input: PackageInput): Promise<ActionResult> {
  const parsed = parseInput(packageSchema, input);
  if (!parsed.ok) return parsed.result;

  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const { data: last } = await supabase
      .from("packages")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data, error } = await supabase
      .from("packages")
      .insert({ ...toRow(parsed.data), sort_order: (last?.sort_order ?? -1) + 1 })
      .select("id")
      .single();
    if (error) throw error;
    await replaceFeatures(supabase, data.id, parsed.data.features);
    invalidate(TAGS.packages);
  });
}

export async function updatePackage(id: string, input: PackageInput): Promise<ActionResult> {
  const parsed = parseInput(packageSchema, input);
  if (!parsed.ok) return parsed.result;

  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const packageId = z.uuid().parse(id);
    const { error } = await supabase
      .from("packages")
      .update(toRow(parsed.data))
      .eq("id", packageId);
    if (error) throw error;
    await replaceFeatures(supabase, packageId, parsed.data.features);
    invalidate(TAGS.packages);
  });
}

export async function setPackageFlag(
  id: string,
  flag: "is_published" | "is_featured",
  value: boolean,
): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const column = z.enum(["is_published", "is_featured"]).parse(flag);
    const checked = z.boolean().parse(value);
    const { error } = await supabase
      .from("packages")
      .update(column === "is_published" ? { is_published: checked } : { is_featured: checked })
      .eq("id", z.uuid().parse(id));
    if (error) throw error;
    invalidate(TAGS.packages);
  });
}

export async function deletePackage(id: string): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("packages").delete().eq("id", z.uuid().parse(id));
    if (error) throw error;
    invalidate(TAGS.packages);
  });
}

export async function reorderPackages(ids: string[]): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.rpc("reorder_items", {
      p_table: "packages",
      p_ids: z.array(z.uuid()).min(1).parse(ids),
    });
    if (error) throw error;
    invalidate(TAGS.packages);
  });
}
