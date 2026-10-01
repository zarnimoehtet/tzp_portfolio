import "server-only";

import { revalidatePath, updateTag } from "next/cache";
import { after } from "next/server";
import type { z } from "zod";

import { UnauthorizedError } from "@/lib/auth";
import type { CacheTag } from "@/lib/cache-tags";
import type { ImageAsset } from "@/lib/images/types";
import { deletePrefix, isOwnR2Url } from "@/lib/r2";
import type { ActionResult } from "@/lib/types";

export function nullIfEmpty(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function parseInput<S extends z.ZodType>(
  schema: S,
  input: unknown,
): { ok: true; data: z.infer<S> } | { ok: false; result: ActionResult<never> } {
  const parsed = schema.safeParse(input);
  if (parsed.success) return { ok: true, data: parsed.data };
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of parsed.error.issues) {
    const path = issue.path.join(".") || "_";
    (fieldErrors[path] ??= []).push(issue.message);
  }
  return {
    ok: false,
    result: { ok: false, error: "Please check the highlighted fields.", fieldErrors },
  };
}

type PostgrestLikeError = { code?: string; message?: string };

function friendlyError(error: unknown): string {
  if (error instanceof UnauthorizedError) return error.message;
  const pg = error as PostgrestLikeError;
  if (pg?.code === "23505") return "That slug is already in use. Choose another.";
  if (pg?.code === "42501") return "You do not have permission to do that.";
  if (error instanceof Error) return error.message;
  if (pg?.message) return pg.message;
  return "Something went wrong. Please try again.";
}

/** Wraps an action body so thrown errors become a typed failure result. */
export async function runAction<T>(
  fn: () => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    console.error("[action]", error);
    return { ok: false, error: friendlyError(error) };
  }
}

/** Expire public cache tags (read-your-writes) and refresh the dashboard. */
export function invalidate(...tags: CacheTag[]) {
  for (const tag of new Set(tags)) updateTag(tag);
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
}

/** Rejects image assets that don't live in this project's R2 bucket. */
export function assertOwnAsset(asset: ImageAsset | null | undefined) {
  if (!asset) return;
  for (const url of [asset.url, asset.medium_url, asset.thumbnail_url]) {
    if (!isOwnR2Url(url)) throw new Error("Image URL is not from this site's storage.");
  }
}

/** Removes stored image variants once the response has been sent. */
export function deleteAssetsLater(keys: (string | null | undefined)[]) {
  const prefixes = keys.filter((k): k is string => Boolean(k));
  if (prefixes.length === 0) return;
  after(async () => {
    await Promise.allSettled(prefixes.map((p) => deletePrefix(p)));
  });
}

/** Keys from `previous` assets that are no longer referenced by `next`. */
export function replacedAssetKeys(
  previous: (ImageAsset | null | undefined)[],
  next: (ImageAsset | null | undefined)[],
): string[] {
  const keep = new Set(next.map((a) => a?.key).filter(Boolean));
  return previous
    .map((a) => a?.key)
    .filter((k): k is string => Boolean(k) && !keep.has(k));
}
