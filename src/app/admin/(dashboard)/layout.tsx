import type { Metadata } from "next";

import { AppSidebar } from "@/components/admin/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { requireAdminPage } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Studio admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireAdminPage();
  const supabase = await createClient();
  const [{ data: settings }, { count: newInquiries }] = await Promise.all([
    supabase.from("site_settings").select("photographer_name").maybeSingle(),
    supabase
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar
          siteName={settings?.photographer_name ?? "Portfolio"}
          email={user.email ?? ""}
          newInquiries={newInquiries ?? 0}
        />
        <SidebarInset>
          <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="text-sm text-muted-foreground">Studio admin</span>
          </header>
          <div className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">{children}</div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster position="bottom-right" richColors />
    </TooltipProvider>
  );
}
