import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/env";
import type { Database } from "./database.types";

const LOGIN_PATH = "/admin/login";

/**
 * Refreshes the Supabase session cookie and performs an optimistic redirect
 * for `/admin/*`. The authoritative admin check runs server-side in the
 * dashboard layout and in every Server Action.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;
  const isLogin = pathname === LOGIN_PATH;

  if (!isSupabaseConfigured) {
    if (isLogin) return response;
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        for (const [key, value] of Object.entries(headers ?? {})) {
          response.headers.set(key, value);
        }
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims?.sub);

  if (!isSignedIn && !isLogin) {
    const url = new URL(LOGIN_PATH, request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}
