import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";
import { getAdminSingletons } from "@/lib/data/admin";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Website settings" };

export default async function SettingsPage() {
  const { settings } = await getAdminSingletons();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Website settings"
        description="Branding, home page hero, design and search engine settings."
      />
      <SettingsForm settings={settings} />
    </div>
  );
}
