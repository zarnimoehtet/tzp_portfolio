import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Public pages never need a session, so the proxy only runs for the admin.
  matcher: ["/admin/:path*"],
};
