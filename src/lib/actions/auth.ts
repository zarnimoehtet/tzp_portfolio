"use server";

import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";
import { loginSchema, type LoginInput } from "@/lib/validations";

export async function login(input: LoginInput): Promise<ActionResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: "Supabase is not configured. See README." };
  }
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Enter a valid email and password." };

  const supabase = await createClient();
  let data: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>["data"];
  let error: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>["error"];
  try {
    ({ data, error } = await supabase.auth.signInWithPassword(parsed.data));
  } catch {
    return {
      ok: false,
      error: "Could not reach Supabase. Check your network connection and try again.",
    };
  }
  if (error || !data.user) {
    const unreachable =
      /fetch failed|network|econnrefused|enotfound|timed out|failed to fetch/i.test(
        error?.message ?? "",
      );
    return {
      ok: false,
      error: unreachable
        ? "Could not reach Supabase. Check your network connection and try again."
        : "Invalid email or password.",
    };
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    return { ok: false, error: "This account does not have admin access." };
  }

  return { ok: true, data: undefined };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
