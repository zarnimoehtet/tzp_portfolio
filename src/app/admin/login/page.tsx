import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getAdminUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getAdminUser()) redirect("/admin");
  const { error, next } = await searchParams;
  const nextPath =
    typeof next === "string" && next.startsWith("/admin") && !next.startsWith("//")
      ? next
      : "/admin";

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Studio admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage photos, albums and content.
          </p>
        </div>
        {!isSupabaseConfigured && (
          <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            Supabase is not configured. Add the environment variables from
            <code className="mx-1">.env.example</code>and restart the server.
          </p>
        )}
        {error === "unauthorized" && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            Your account does not have admin access.
          </p>
        )}
        <LoginForm next={nextPath} />
      </div>
    </main>
  );
}
