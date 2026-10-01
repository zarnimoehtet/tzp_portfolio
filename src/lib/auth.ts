import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { User } from "@supabase/supabase-js";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export class UnauthorizedError extends Error {
  constructor() {
    super("You must be signed in as an admin to do that.");
  }
}

/** Returns the signed-in user if they are listed in `public.admins`. */
export const getAdminUser = cache(async (): Promise<User | null> => {
  // Admin access is always per-request; never prerender it.
  await connection();
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return data ? user : null;
});

/** For pages/layouts: redirect to login when not an admin. */
export async function requireAdminPage(): Promise<User> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login?error=unauthorized");
  return user;
}

/**
 * For Server Actions and Route Handlers: throws when not an admin and returns
 * a Supabase client bound to the admin's session.
 */
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new UnauthorizedError();
  const supabase = await createClient();
  return { user, supabase };
}
