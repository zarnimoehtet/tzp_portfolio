import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { supabaseAnonKey, supabaseUrl } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Cookie-aware client for Server Components, Server Actions and Route
 * Handlers. Requests run as the signed-in user, so RLS applies.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component; the proxy refreshes sessions.
        }
      },
    },
  });
}

/**
 * Anonymous, cookie-less client for public reads. Because it never touches
 * request data, its results can be cached and shared across visitors.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
